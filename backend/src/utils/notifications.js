const User = require('../models/User');
const Notification = require('../models/Notification');
const admin = require('firebase-admin');

let firebaseInitialized = false;

const initializeFirebase = () => {
  if (firebaseInitialized) return true;
  
  try {
    if (!admin.apps.length) {
      const serviceAccount = require('../../firebase-service-account.json');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
    firebaseInitialized = true;
    return true;
  } catch (error) {
    console.error('Firebase não inicializado:', error.message);
    return false;
  }
};

const sendTaskNotification = async (userId, status, missionTitle, data = {}) => {
  try {
    if (!initializeFirebase()) {
      console.log('Firebase não disponível, apenas email será enviado');
      return;
    }

    const user = await User.findById(userId);
    if (!user || !user.devices || user.devices.length === 0) {
      console.log('Usuário sem dispositivos registrados');
      return;
    }

    const tokens = user.devices.map(d => d.token);

    let title, body;
    
    if (status === 'approved') {
      title = '✅ Tarefa Aprovada!';
      body = `Parabéns! Sua tarefa "${missionTitle}" foi aprovada. +${data.experienceReward}XP +${data.pointsReward} pontos!`;
    } else {
      title = '❌ Tarefa Rejeitada';
      body = `Sua tarefa "${missionTitle}" precisa de ajustes. Revise e tente novamente!`;
    }

    const message = {
      notification: {
        title,
        body
      },
      data: {
        type: 'task_review',
        status,
        missionTitle,
        experienceReward: String(data.experienceReward || 0),
        pointsReward: String(data.pointsReward || 0),
        reviewComment: data.reviewComment || '',
        sentAt: new Date().toISOString()
      }
    };

    let successCount = 0;
    let failureCount = 0;

    for (const token of tokens) {
      try {
        await admin.messaging().send({
          ...message,
          token
        });
        successCount++;
        console.log(`Notificação enviada para ${user.name}`);
      } catch (error) {
        console.error('Erro ao enviar notificação:', error.message);
        failureCount++;
        
        if (error.code === 'messaging/invalid-registration-token' || 
            error.code === 'messaging/registration-token-not-registered') {
          await user.removeDevice(token);
        }
      }
    }

    const notification = new Notification({
      title,
      body,
      type: 'user',
      targetUser: userId,
      sentBy: null,
      recipients: tokens.length,
      successful: successCount,
      failed: failureCount,
      data: {
        type: 'task_review',
        status,
        missionTitle
      }
    });

    await notification.save();

    return {
      success: successCount > 0,
      stats: { total: tokens.length, successful: successCount, failed: failureCount }
    };
  } catch (error) {
    console.error('Erro ao enviar notificação de tarefa:', error);
    return { success: false, error: error.message };
  }
};

const sendCustomNotification = async (userId, title, body, customData = {}) => {
  try {
    if (!initializeFirebase()) {
      console.log('Firebase não disponível');
      return;
    }

    const user = await User.findById(userId);
    if (!user || !user.devices || user.devices.length === 0) {
      return;
    }

    const tokens = user.devices.map(d => d.token);

    const message = {
      notification: { title, body },
      data: {
        ...customData,
        sentAt: new Date().toISOString()
      }
    };

    let successCount = 0;

    for (const token of tokens) {
      try {
        await admin.messaging().send({ ...message, token });
        successCount++;
      } catch (error) {
        console.error('Erro ao enviar:', error.message);
      }
    }

    return { success: successCount > 0 };
  } catch (error) {
    console.error('Erro ao enviar notificação custom:', error);
    return { success: false };
  }
};

const sendPhaseUnlockedNotification = async (userId, phaseTitle) => {
  return sendCustomNotification(
    userId,
    '🎉 Nova Fase Desbloqueada!',
    `Você desbloqueou a fase "${phaseTitle}". Explore novos desafios!`,
    { type: 'phase_unlocked', phaseTitle }
  );
};

const sendAchievementNotification = async (userId, achievementTitle) => {
  return sendCustomNotification(
    userId,
    '🏆 Conquista Desbloqueada!',
    `Parabéns! Você conquistou: ${achievementTitle}`,
    { type: 'achievement', achievementTitle }
  );
};

const sendLevelUpNotification = async (userId, newLevel) => {
  return sendCustomNotification(
    userId,
    '⬆️ Você Subiu de Nível!',
    `Parabéns! Você atingiu o nível ${newLevel}!`,
    { type: 'level_up', level: String(newLevel) }
  );
};

const sendRankingNotification = async (userId, newPosition) => {
  return sendCustomNotification(
    userId,
    '📈 Ranking Atualizado!',
    `Você está em ${newPosition}º lugar no ranking!`,
    { type: 'ranking', position: String(newPosition) }
  );
};

const sendBulkNotification = async (userIds, title, body, data = {}) => {
  try {
    if (!initializeFirebase()) {
      console.log('Firebase não disponível');
      return { success: false };
    }

    const users = await User.find({ 
      _id: { $in: userIds },
      'devices.0': { $exists: true }
    });

    const tokens = [];
    users.forEach(user => {
      user.devices.forEach(device => {
        tokens.push(device.token);
      });
    });

    if (tokens.length === 0) {
      return { success: false, message: 'Nenhum dispositivo encontrado' };
    }

    const message = {
      notification: { title, body },
      data: {
        ...data,
        sentAt: new Date().toISOString()
      }
    };

    let successCount = 0;

    for (const token of tokens) {
      try {
        await admin.messaging().send({ ...message, token });
        successCount++;
      } catch (error) {
        console.error('Erro ao enviar:', error.message);
      }
    }

    return { 
      success: successCount > 0,
      stats: { total: tokens.length, successful: successCount }
    };
  } catch (error) {
    console.error('Erro ao enviar notificações em lote:', error);
    return { success: false };
  }
};

module.exports = {
  sendTaskNotification,
  sendCustomNotification,
  sendPhaseUnlockedNotification,
  sendAchievementNotification,
  sendLevelUpNotification,
  sendRankingNotification,
  sendBulkNotification
};
