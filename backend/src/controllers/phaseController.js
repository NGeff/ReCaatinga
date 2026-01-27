const Phase = require('../models/Phase');
const Mission = require('../models/Mission');
const Game = require('../models/Game');
const UserProgress = require('../models/UserProgress');
const Achievement = require('../models/Achievement');

exports.createPhase = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      difficulty, 
      order, 
      experienceReward,
      pointsReward,
      category, 
      requiredLevel,
      introVideoUrl,
      badge,
      badgeTitle,
      badgeDescription
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Título e descrição são obrigatórios' });
    }

    if (!introVideoUrl) {
      return res.status(400).json({ message: 'URL do vídeo de introdução é obrigatória' });
    }

    let finalOrder = order;
    if (!finalOrder) {
      const maxPhase = await Phase.findOne().sort({ order: -1 }).select('order');
      finalOrder = maxPhase ? maxPhase.order + 1 : 1;
    } else {
      const existingPhase = await Phase.findOne({ order: finalOrder });
      if (existingPhase) {
        await Phase.updateMany(
          { order: { $gte: finalOrder } },
          { $inc: { order: 1 } }
        );
      }
    }

    const phase = await Phase.create({
      title,
      description,
      difficulty: difficulty || 'facil',
      order: finalOrder,
      experienceReward: experienceReward || 100,
      pointsReward: pointsReward || 50,
      category: category || 'educacao',
      requiredLevel: requiredLevel || 1,
      introVideoUrl,
      badge: badge || '/badges/default-phase.png',
      badgeTitle: badgeTitle || 'Explorador da Caatinga',
      badgeDescription: badgeDescription || `Completou a fase: ${title}`,
      createdBy: req.user.id
    });

    const achievement = await Achievement.create({
      title: `Mestre: ${title}`,
      description: `Complete a fase "${title}" para desbloquear esta conquista`,
      badge: badge || '/badges/default-phase.png',
      type: 'phase',
      requirement: 1,
      rarity: 'raro',
      pointsReward: pointsReward || 50,
      phase: phase._id,
      isActive: true
    });

    phase.achievement = achievement._id;
    await phase.save();

    res.status(201).json(phase);
  } catch (error) {
    console.error('Erro ao criar fase:', error);
    res.status(500).json({ 
      message: 'Erro ao criar fase',
      error: error.message 
    });
  }
};

exports.getAllPhases = async (req, res) => {
  try {
    const phases = await Phase.find({ isActive: true })
      .populate('missions')
      .populate('createdBy', 'name email')
      .populate('achievement')
      .sort({ order: 1 })
      .lean();

    const userId = req.user?.id;
    let userProgressMap = {};

    if (userId) {
      const allUserProgress = await UserProgress.find({ user: userId });
      allUserProgress.forEach(up => {
        userProgressMap[up.phase.toString()] = up;
      });
    }

    const phasesWithAccess = await Promise.all(
      phases.map(async (phase, index) => {
        const missions = await Mission.find({ 
          phase: phase._id, 
          isActive: true 
        }).select('_id').lean();

        const missionIds = missions.map(m => m._id);

        const games = await Game.find({ 
          mission: { $in: missionIds },
          isActive: true 
        }).lean();

        const userProgress = userProgressMap[phase._id.toString()];
        const previousPhase = index > 0 ? phases[index - 1] : null;
        const previousPhaseProgress = previousPhase ? userProgressMap[previousPhase._id.toString()] : null;

        const isUnlocked = index === 0 || (previousPhaseProgress && previousPhaseProgress.phaseCompleted);

        return {
          ...phase,
          games: games,
          gamesCount: games.length,
          missionsCount: missions.length,
          isUnlocked,
          userProgress: userProgress || null
        };
      })
    );

    res.json(phasesWithAccess);
  } catch (error) {
    console.error('Erro ao buscar fases:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar fases',
      error: error.message 
    });
  }
};

exports.getPhaseById = async (req, res) => {
  try {
    const phase = await Phase.findById(req.params.id)
      .populate('missions')
      .populate('createdBy', 'name email')
      .populate('achievement')
      .lean();

    if (!phase) {
      return res.status(404).json({ message: 'Fase não encontrada' });
    }

    const missions = await Mission.find({ 
      phase: phase._id, 
      isActive: true 
    }).select('_id').lean();

    const missionIds = missions.map(m => m._id);

    const games = await Game.find({ 
      mission: { $in: missionIds },
      isActive: true 
    }).lean();

    const allPhases = await Phase.find({ isActive: true }).sort({ order: 1 }).lean();
    const currentPhaseIndex = allPhases.findIndex(p => p._id.toString() === phase._id.toString());
    
    let isUnlocked = true;
    if (currentPhaseIndex > 0 && req.user) {
      const previousPhase = allPhases[currentPhaseIndex - 1];
      const previousPhaseProgress = await UserProgress.findOne({
        user: req.user.id,
        phase: previousPhase._id
      });

      isUnlocked = previousPhaseProgress && previousPhaseProgress.phaseCompleted;
    }

    phase.games = games;
    phase.gamesCount = games.length;
    phase.missionsCount = missions.length;
    phase.isUnlocked = isUnlocked;

    res.json(phase);
  } catch (error) {
    console.error('Erro ao buscar fase:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar fase',
      error: error.message 
    });
  }
};

exports.updatePhase = async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    if (updateData.order !== undefined) {
      const phase = await Phase.findById(req.params.id);
      if (!phase) {
        return res.status(404).json({ message: 'Fase não encontrada' });
      }

      const oldOrder = phase.order;
      const newOrder = updateData.order;

      if (oldOrder !== newOrder) {
        const existingPhase = await Phase.findOne({ 
          order: newOrder, 
          _id: { $ne: req.params.id },
          isActive: true 
        });

        if (existingPhase) {
          if (newOrder < oldOrder) {
            await Phase.updateMany(
              { order: { $gte: newOrder, $lt: oldOrder }, _id: { $ne: req.params.id }, isActive: true },
              { $inc: { order: 1 } }
            );
          } else {
            await Phase.updateMany(
              { order: { $gt: oldOrder, $lte: newOrder }, _id: { $ne: req.params.id }, isActive: true },
              { $inc: { order: -1 } }
            );
          }
        }
      }
    }
    
    if (updateData.badgeTitle || updateData.badge) {
      const phase = await Phase.findById(req.params.id);
      if (phase && phase.achievement) {
        await Achievement.findByIdAndUpdate(phase.achievement, {
          badge: updateData.badge || phase.badge,
          title: updateData.badgeTitle ? `Mestre: ${updateData.badgeTitle}` : undefined
        });
      }
    }

    const phase = await Phase.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('achievement');

    if (!phase) {
      return res.status(404).json({ message: 'Fase não encontrada' });
    }

    res.json(phase);
  } catch (error) {
    console.error('Erro ao atualizar fase:', error);
    res.status(500).json({ 
      message: 'Erro ao atualizar fase',
      error: error.message 
    });
  }
};

exports.deletePhase = async (req, res) => {
  try {
    const phase = await Phase.findById(req.params.id);

    if (!phase) {
      return res.status(404).json({ message: 'Fase não encontrada' });
    }

    const oldOrder = phase.order;

    phase.isActive = false;
    await phase.save({ validateBeforeSave: false });

    if (phase.achievement) {
      await Achievement.findByIdAndUpdate(phase.achievement, { isActive: false });
    }

    await Phase.updateMany(
      { order: { $gt: oldOrder }, isActive: true },
      { $inc: { order: -1 } }
    );

    res.json({ message: 'Fase desativada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar fase:', error);
    res.status(500).json({ 
      message: 'Erro ao deletar fase',
      error: error.message 
    });
  }
};

exports.getPhaseBadges = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    
    const User = require('../models/User');
    const user = await User.findById(userId)
      .populate('badges.phase', 'title')
      .select('badges completedPhases');

    res.json({
      badges: user.badges || [],
      completedPhases: user.completedPhases || []
    });
  } catch (error) {
    console.error('Erro ao buscar badges:', error);
    res.status(500).json({ message: 'Erro ao buscar badges' });
  }
};
