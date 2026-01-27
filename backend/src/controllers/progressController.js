const Progress = require('../models/Progress');
const UserProgress = require('../models/UserProgress');
const Phase = require('../models/Phase');
const Mission = require('../models/Mission');
const Game = require('../models/Game');
const User = require('../models/User');
const TaskSubmission = require('../models/TaskSubmission');

exports.getUserProgress = async (req, res) => {
  try {
    const progress = await Progress.find({ user: req.user.id })
      .populate('game')
      .populate('phase')
      .sort({ createdAt: -1 });

    res.json(progress);
  } catch (error) {
    console.error('Erro ao buscar progresso:', error);
    res.status(500).json({ message: 'Erro ao buscar progresso' });
  }
};

exports.getPhaseProgress = async (req, res) => {
  try {
    const { phaseId } = req.params;

    let userProgress = await UserProgress.findOne({
      user: req.user.id,
      phase: phaseId
    })
    .populate('completedMissions.mission')
    .populate('completedGames.game')
    .populate('currentMission')
    .populate('currentGame');

    if (!userProgress) {
      userProgress = {
        videoWatched: false,
        completedMissions: [],
        completedGames: [],
        phaseCompleted: false
      };
    }

    const missions = await Mission.find({ 
      phase: phaseId, 
      isActive: true 
    }).sort({ order: 1 });

    const taskSubmissions = await TaskSubmission.find({
      user: req.user.id,
      phase: phaseId
    });

    const submissionsMap = {};
    taskSubmissions.forEach(sub => {
      const missionId = sub.mission.toString();
      if (!submissionsMap[missionId]) {
        submissionsMap[missionId] = {
          status: sub.status,
          hasApproved: false,
          hasPending: false,
          hasRejected: false
        };
      }
      
      if (sub.status === 'approved') {
        submissionsMap[missionId].hasApproved = true;
        submissionsMap[missionId].status = 'approved';
      } else if (sub.status === 'pending') {
        submissionsMap[missionId].hasPending = true;
        if (submissionsMap[missionId].status !== 'approved') {
          submissionsMap[missionId].status = 'pending';
        }
      } else if (sub.status === 'rejected') {
        submissionsMap[missionId].hasRejected = true;
        if (submissionsMap[missionId].status !== 'approved' && submissionsMap[missionId].status !== 'pending') {
          submissionsMap[missionId].status = 'rejected';
        }
      }
    });

    res.json({
      phase: phaseId,
      videoWatched: userProgress.videoWatched || false,
      completedMissions: userProgress.completedMissions || [],
      completedGames: userProgress.completedGames || [],
      currentMission: userProgress.currentMission,
      currentGame: userProgress.currentGame,
      phaseCompleted: userProgress.phaseCompleted || false,
      totalMissions: missions.length,
      taskSubmissions: submissionsMap
    });
  } catch (error) {
    console.error('Erro ao buscar progresso da fase:', error);
    res.status(500).json({ message: 'Erro ao buscar progresso da fase' });
  }
};

exports.markVideoWatched = async (req, res) => {
  try {
    const { phaseId } = req.params;

    const phase = await Phase.findById(phaseId);
    if (!phase) {
      return res.status(404).json({ message: 'Fase não encontrada' });
    }

    let userProgress = await UserProgress.findOne({
      user: req.user.id,
      phase: phaseId
    });

    if (!userProgress) {
      userProgress = await UserProgress.create({
        user: req.user.id,
        phase: phaseId,
        videoWatched: true,
        watchedAt: new Date()
      });
    } else if (!userProgress.videoWatched) {
      userProgress.videoWatched = true;
      userProgress.watchedAt = new Date();
      await userProgress.save();
    }

    res.json({ 
      message: 'Vídeo marcado como assistido! Agora você pode iniciar as atividades.', 
      progress: userProgress 
    });
  } catch (error) {
    console.error('Erro ao marcar vídeo:', error);
    res.status(500).json({ message: 'Erro ao marcar vídeo' });
  }
};

exports.completeMission = async (req, res) => {
  try {
    const { missionId } = req.params;
    const { score } = req.body;

    const mission = await Mission.findById(missionId).populate('phase');
    if (!mission) {
      return res.status(404).json({ message: 'Missão não encontrada' });
    }

    let userProgress = await UserProgress.findOne({
      user: req.user.id,
      phase: mission.phase._id
    });

    if (!userProgress) {
      return res.status(400).json({ message: 'Assista o vídeo da fase primeiro' });
    }

    const alreadyCompleted = userProgress.completedMissions.some(
      cm => cm.mission.toString() === missionId
    );

    if (alreadyCompleted) {
      return res.json({ 
        message: 'Missão já completada', 
        progress: userProgress,
        alreadyCompleted: true 
      });
    }

    if (mission.type === 'jogos') {
      const missionGames = await Game.find({ 
        mission: missionId, 
        isActive: true 
      });

      const allGamesCompleted = missionGames.every(game => 
        userProgress.completedGames.some(cg => cg.game.toString() === game._id.toString())
      );

      if (!allGamesCompleted) {
        return res.status(400).json({ 
          message: 'Complete todos os jogos da missão primeiro!' 
        });
      }
    }

    userProgress.completedMissions.push({
      mission: missionId,
      completedAt: new Date(),
      score: score || 100
    });

    const user = await User.findById(req.user.id);
    await user.addExperience(mission.experienceReward);
    user.totalPoints += mission.pointsReward;
    await user.save();

    const allMissions = await Mission.find({ 
      phase: mission.phase._id, 
      isActive: true 
    });

    let phaseCompletedNow = false;
    if (userProgress.completedMissions.length >= allMissions.length) {
      userProgress.phaseCompleted = true;
      userProgress.completedAt = new Date();
      phaseCompletedNow = true;
      
      await user.addExperience(mission.phase.experienceReward || 0);
      user.totalPoints += mission.phase.pointsReward || 0;
      await user.save();
    }

    await userProgress.save();

    const { checkAchievements } = require('./achievementController');
    const newAchievements = await checkAchievements(req.user.id);

    return res.json({
      message: phaseCompletedNow ? '🎉 Fase completada! Badge desbloqueado!' : 'Missão completada!',
      progress: userProgress,
      user: {
        level: user.level,
        totalExperience: user.totalExperience,
        totalPoints: user.totalPoints,
      },
      newAchievements,
      phaseCompleted: phaseCompletedNow,
      badge: phaseCompletedNow ? {
        badge: mission.phase.badge,
        title: mission.phase.badgeTitle,
        description: mission.phase.badgeDescription
      } : null
    });
  } catch (error) {
    console.error('Erro ao completar missão:', error);
    res.status(500).json({ message: 'Erro ao completar missão' });
  }
};

exports.getOverallProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const phases = await Phase.find({ isActive: true }).sort({ order: 1 });

    const phasesProgress = await Promise.all(
      phases.map(async (phase) => {
        const userProgress = await UserProgress.findOne({
          user: req.user.id,
          phase: phase._id
        });

        const missions = await Mission.find({ 
          phase: phase._id, 
          isActive: true 
        });

        const completedMissions = userProgress?.completedMissions?.length || 0;
        const totalMissions = missions.length;
        const percentage = totalMissions > 0 ? (completedMissions / totalMissions) * 100 : 0;

        return {
          phase: {
            _id: phase._id,
            title: phase.title,
            category: phase.category,
            order: phase.order,
            badge: phase.badge,
            badgeTitle: phase.badgeTitle
          },
          videoWatched: userProgress?.videoWatched || false,
          totalMissions,
          completedMissions,
          percentage: Math.round(percentage),
          completed: userProgress?.phaseCompleted || false
        };
      })
    );

    const totalProgress = await UserProgress.find({ user: req.user.id });
    const completedGamesCount = totalProgress.reduce(
      (sum, p) => sum + (p.completedGames?.length || 0), 0
    );

    const completedMissionsCount = totalProgress.reduce(
      (sum, p) => sum + (p.completedMissions?.length || 0), 0
    );

    const completedPhasesCount = await UserProgress.countDocuments({
      user: req.user.id,
      phaseCompleted: true
    });

    res.json({
      user: {
        level: user.level,
        totalExperience: user.totalExperience,
        totalPoints: user.totalPoints,
        activeBadge: user.activeBadge
      },
      completedPhases: completedPhasesCount,
      totalPhases: phases.length,
      completedGames: completedGamesCount,
      completedMissions: completedMissionsCount,
      phasesProgress
    });
  } catch (error) {
    console.error('Erro ao buscar progresso geral:', error);
    res.status(500).json({ message: 'Erro ao buscar progresso geral' });
  }
};

exports.setActiveBadge = async (req, res) => {
  try {
    const { phaseId } = req.body;
    
    const user = await User.findById(req.user.id);
    const phase = await Phase.findById(phaseId);
    
    if (!phase) {
      return res.status(404).json({ message: 'Fase não encontrada' });
    }

    const userProgress = await UserProgress.findOne({
      user: req.user.id,
      phase: phaseId,
      phaseCompleted: true
    });

    if (!userProgress) {
      return res.status(403).json({ message: 'Você precisa completar esta fase primeiro' });
    }

    user.activeBadge = phaseId;
    await user.save();

    res.json({ 
      message: 'Badge ativo atualizado!',
      activeBadge: {
        phase: phaseId,
        badge: phase.badge,
        title: phase.badgeTitle,
        description: phase.badgeDescription
      }
    });
  } catch (error) {
    console.error('Erro ao definir badge ativo:', error);
    res.status(500).json({ message: 'Erro ao definir badge ativo' });
  }
};
