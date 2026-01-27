const User = require('../models/User');
const Notification = require('../models/Notification');
const admin = require('firebase-admin');
const path = require('path');

let firebaseInitialized = false;

const initializeFirebase = () => {
  if (firebaseInitialized) return;
  
  try {
    const serviceAccountPath = path.join(__dirname, '../../firebase-service-account.json');
    const serviceAccount = require(serviceAccountPath);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    firebaseInitialized = true;
    console.log('Firebase Admin inicializado com sucesso');
  } catch (error) {
    console.error('Erro ao inicializar Firebase Admin:', error.message);
  }
};

initializeFirebase();

exports.registerDevice = async (req, res) => {
  try {
    const { deviceToken, platform } = req.body;
    
    if (!deviceToken || !platform) {
      return res.status(400).json({ message: 'Token e plataforma são obrigatórios' });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    await user.addDevice(deviceToken, platform);

    res.json({ 
      success: true,
      message: 'Dispositivo registrado com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao registrar dispositivo:', error);
    res.status(500).json({ message: 'Erro ao registrar dispositivo' });
  }
};

exports.sendToAll = async (req, res) => {
  try {
    const { title, body, data = {} } = req.body;

    if (!title || !body) {
      return res.status(400).json({ message: 'Título e mensagem são obrigatórios' });
    }

    if (!firebaseInitialized) {
      return res.status(503).json({ message: 'Serviço de notificações não disponível' });
    }

    const users = await User.find({ 
      'devices.0': { $exists: true } 
    });

    if (users.length === 0) {
      return res.status(404).json({ message: 'Nenhum usuário com dispositivo registrado' });
    }

    const tokens = [];
    users.forEach(user => {
      user.devices.forEach(device => {
        tokens.push(device.token);
      });
    });

    console.log(`Enviando notificação para ${tokens.length} dispositivos`);

    const message = {
      notification: {
        title,
        body
      },
      data: {
        ...data,
        type: 'general',
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
      } catch (error) {
        console.error('Erro ao enviar para token:', error.message);
        failureCount++;
      }
    }

    const notification = new Notification({
      title,
      body,
      type: 'all',
      sentBy: req.user.id,
      recipients: tokens.length,
      successful: successCount,
      failed: failureCount,
      data
    });

    await notification.save();

    res.json({
      success: true,
      message: 'Notificações enviadas',
      stats: {
        total: tokens.length,
        successful: successCount,
        failed: failureCount
      }
    });
  } catch (error) {
    console.error('Erro ao enviar notificações:', error);
    res.status(500).json({ message: 'Erro ao enviar notificações' });
  }
};

exports.sendToUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { title, body, data = {} } = req.body;

    if (!title || !body) {
      return res.status(400).json({ message: 'Título e mensagem são obrigatórios' });
    }

    if (!firebaseInitialized) {
      return res.status(503).json({ message: 'Serviço de notificações não disponível' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    if (!user.devices || user.devices.length === 0) {
      return res.status(404).json({ message: 'Usuário não tem dispositivos registrados' });
    }

    const tokens = user.devices.map(d => d.token);

    console.log(`Enviando notificação para ${tokens.length} dispositivos do usuário ${userId}`);

    const message = {
      notification: {
        title,
        body
      },
      data: {
        ...data,
        type: 'personal',
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
      } catch (error) {
        console.error('Erro ao enviar para token:', error.message);
        failureCount++;
      }
    }

    const notification = new Notification({
      title,
      body,
      type: 'user',
      targetUser: userId,
      sentBy: req.user.id,
      recipients: tokens.length,
      successful: successCount,
      failed: failureCount,
      data
    });

    await notification.save();

    res.json({
      success: true,
      message: 'Notificação enviada',
      stats: {
        total: tokens.length,
        successful: successCount,
        failed: failureCount
      }
    });
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
    res.status(500).json({ message: 'Erro ao enviar notificação' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate('targetUser', 'name email')
      .populate('sentBy', 'name')
      .sort({ sentAt: -1 })
      .limit(50);

    const formatted = notifications.map(n => ({
      _id: n._id,
      title: n.title,
      body: n.body,
      type: n.type,
      userName: n.targetUser?.name || null,
      sentBy: n.sentBy?.name || 'Sistema',
      sentAt: n.sentAt,
      recipients: n.recipients,
      successful: n.successful,
      failed: n.failed
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ message: 'Erro ao buscar histórico' });
  }
};

exports.removeDevice = async (req, res) => {
  try {
    const { deviceToken } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    await user.removeDevice(deviceToken);

    res.json({ 
      success: true,
      message: 'Dispositivo removido com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao remover dispositivo:', error);
    res.status(500).json({ message: 'Erro ao remover dispositivo' });
  }
};