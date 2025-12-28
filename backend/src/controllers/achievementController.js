const Achievement = require('../models/Achievement');
const User = require('../models/User');
const Progress = require('../models/Progress');
const Mission = require('../models/Mission');

exports.checkAchievements = async (userId) => {
  try {
    const user = await User.findById(userId).populate('achievements.achievement');
    const allAchievements = await Achievement.find({ isActive: true });
    const newAchievements = [];

    for (const achievement of allAchievements) {
      const hasAchievement = user.achievements.some(
        a => a.achievement && a.achievement._id.toString() === achievement._id.toString()
      );

      if (!hasAchievement) {
        let shouldUnlock = false;

        switch (achievement.type) {
          case 'level':
            shouldUnlock = user.level >= achievement.requirement;
            break;

          case 'points':
            shouldUnlock = user.totalPoints >= achievement.requirement;
            break;

          case 'games':
            const completedGamesCount = await Progress.countDocuments({
              user: userId,
              completed: true
            });
            shouldUnlock = completedGamesCount >= achievement.requirement;
            break;

          case 'phase':
            shouldUnlock = user.completedPhases.length >= achievement.requirement;
            break;

          case 'mission':
            const completedMissionsCount = await Progress.aggregate([
              { $match: { user: userId, completed: true } },
              { $group: { _id: '$mission' } },
              { $count: 'total' }
            ]);
            const missionsCount = completedMissionsCount[0]?.total || 0;
            shouldUnlock = missionsCount >= achievement.requirement;
            break;
        }

        if (shouldUnlock) {
          user.achievements.push({
            achievement: achievement._id,
            unlockedAt: new Date()
          });
          user.totalPoints += achievement.pointsReward;
          newAchievements.push(achievement);
        }
      }
    }

    if (newAchievements.length > 0) {
      await user.save();
    }

    return newAchievements;
  } catch (error) {
    console.error('Erro ao verificar conquistas:', error);
    return [];
  }
};

exports.createAchievement = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      badge, 
      type, 
      requirement, 
      rarity, 
      pointsReward,
      phase 
    } = req.body;

    const achievementData = {
      title,
      description,
      badge: badge || '/badges/default.png',
      type,
      requirement,
      rarity: rarity || 'comum',
      pointsReward: pointsReward || 0
    };

    if (phase) {
      achievementData.phase = phase;
    }

    const achievement = await Achievement.create(achievementData);

    res.status(201).json(achievement);
  } catch (error) {
    console.error('Erro ao criar conquista:', error);
    res.status(500).json({ message: 'Erro ao criar conquista' });
  }
};

exports.getAllAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find({ isActive: true })
      .populate('phase', 'title')
      .sort({ rarity: -1, requirement: 1 });

    res.json(achievements);
  } catch (error) {
    console.error('Erro ao buscar conquistas:', error);
    res.status(500).json({ message: 'Erro ao buscar conquistas' });
  }
};

exports.getUserAchievements = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'achievements.achievement',
        match: { isActive: true }
      })
      .select('achievements');

    const validAchievements = user.achievements.filter(a => a.achievement !== null);

    res.json(validAchievements);
  } catch (error) {
    console.error('Erro ao buscar conquistas do usuário:', error);
    res.status(500).json({ message: 'Erro ao buscar conquistas do usuário' });
  }
};

exports.getAchievementById = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id)
      .populate('phase', 'title description');

    if (!achievement) {
      return res.status(404).json({ message: 'Conquista não encontrada' });
    }

    res.json(achievement);
  } catch (error) {
    console.error('Erro ao buscar conquista:', error);
    res.status(500).json({ message: 'Erro ao buscar conquista' });
  }
};

exports.updateAchievement = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      badge, 
      type, 
      requirement, 
      rarity, 
      pointsReward,
      phase,
      isActive
    } = req.body;

    const achievement = await Achievement.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        badge,
        type,
        requirement,
        rarity,
        pointsReward,
        phase,
        isActive
      },
      { new: true, runValidators: true }
    );

    if (!achievement) {
      return res.status(404).json({ message: 'Conquista não encontrada' });
    }

    res.json(achievement);
  } catch (error) {
    console.error('Erro ao atualizar conquista:', error);
    res.status(500).json({ message: 'Erro ao atualizar conquista' });
  }
};

exports.deleteAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);

    if (!achievement) {
      return res.status(404).json({ message: 'Conquista não encontrada' });
    }

    achievement.isActive = false;
    await achievement.save();

    res.json({ message: 'Conquista desativada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar conquista:', error);
    res.status(500).json({ message: 'Erro ao deletar conquista' });
  }
};

exports.getUserAchievementStats = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;

    const user = await User.findById(userId)
      .populate('achievements.achievement')
      .select('achievements');

    const allAchievements = await Achievement.find({ isActive: true });

    const unlockedCount = user.achievements.filter(a => a.achievement !== null).length;
    const totalCount = allAchievements.length;
    const progressPercentage = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

    const rarityCount = {
      comum: 0,
      raro: 0,
      epico: 0,
      lendario: 0
    };

    user.achievements.forEach(ua => {
      if (ua.achievement) {
        rarityCount[ua.achievement.rarity]++;
      }
    });

    res.json({
      unlocked: unlockedCount,
      total: totalCount,
      percentage: Math.round(progressPercentage),
      byRarity: rarityCount,
      recentUnlocks: user.achievements
        .filter(a => a.achievement !== null)
        .sort((a, b) => b.unlockedAt - a.unlockedAt)
        .slice(0, 5)
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ message: 'Erro ao buscar estatísticas' });
  }
};
