const Game = require('../models/Game');
const Phase = require('../models/Phase');
const Mission = require('../models/Mission');
const Progress = require('../models/Progress');
const UserProgress = require('../models/UserProgress');
const User = require('../models/User');

exports.createGame = async (req, res) => {
  try {
    const { title, type, phase, mission, content, points, timeLimit, order, maxAttempts } = req.body;

    if (!mission) {
      return res.status(400).json({ message: 'Missão é obrigatória para criar um jogo' });
    }

    const phaseExists = await Phase.findById(phase);
    if (!phaseExists) {
      return res.status(404).json({ message: 'Fase não encontrada' });
    }

    const missionExists = await Mission.findById(mission);
    if (!missionExists) {
      return res.status(404).json({ message: 'Missão não encontrada' });
    }

    if (missionExists.type !== 'jogos') {
      return res.status(400).json({ message: 'A missão selecionada não é do tipo "Jogos Educacionais"' });
    }

    let finalOrder = order;
    if (!finalOrder) {
      const maxGame = await Game.findOne({ mission }).sort({ order: -1 }).select('order');
      finalOrder = maxGame ? maxGame.order + 1 : 1;
    } else {
      const existingGame = await Game.findOne({ mission, order: finalOrder });
      if (existingGame) {
        await Game.updateMany(
          { mission, order: { $gte: finalOrder } },
          { $inc: { order: 1 } }
        );
      }
    }

    const game = await Game.create({
      title,
      type,
      phase,
      mission,
      content,
      points: points || 10,
      timeLimit: timeLimit || 0,
      maxAttempts: maxAttempts || 3,
      order: finalOrder,
    });

    await Mission.findByIdAndUpdate(mission, {
      $push: { games: game._id }
    });

    res.status(201).json(game);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao criar jogo', error: error.message });
  }
};

exports.getGamesByPhase = async (req, res) => {
  try {
    const games = await Game.find({ 
      phase: req.params.phaseId,
      isActive: true 
    })
    .populate('mission')
    .sort({ order: 1 });

    const userProgress = await UserProgress.findOne({
      user: req.user.id,
      phase: req.params.phaseId
    });

    const gamesWithProgress = games.map((game, index) => {
      const isCompleted = userProgress?.completedGames?.some(
        cg => cg.game.toString() === game._id.toString()
      );

      const isUnlocked = userProgress?.videoWatched && (
        index === 0 || 
        userProgress?.completedGames?.some(
          cg => cg.game.toString() === games[index - 1]._id.toString()
        )
      );

      return {
        ...game.toObject(),
        isCompleted,
        isUnlocked
      };
    });

    res.json(gamesWithProgress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar jogos' });
  }
};

exports.getGameById = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id)
      .populate('phase')
      .populate('mission');

    if (!game) {
      return res.status(404).json({ message: 'Jogo não encontrado' });
    }

    const userProgress = await UserProgress.findOne({
      user: req.user.id,
      phase: game.phase._id
    });

    const isCompleted = userProgress?.completedGames?.some(
      cg => cg.game.toString() === req.params.id
    );

    const allGames = await Game.find({ 
      mission: game.mission._id,
      isActive: true 
    }).sort({ order: 1 });

    const gameIndex = allGames.findIndex(g => g._id.toString() === game._id.toString());

    const isUnlocked = gameIndex === 0 || userProgress?.completedGames?.some(
      cg => cg.game.toString() === allGames[gameIndex - 1]._id.toString()
    );

    res.json({
      ...game.toObject(),
      isCompleted,
      isUnlocked
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar jogo' });
  }
};

exports.getGamesByMission = async (req, res) => {
  try {
    const games = await Game.find({ 
      mission: req.params.missionId,
      isActive: true 
    }).sort({ order: 1 });

    const mission = await Mission.findById(req.params.missionId);
    if (!mission) {
      return res.status(404).json({ message: 'Missão não encontrada' });
    }

    const userProgress = await UserProgress.findOne({
      user: req.user.id,
      phase: mission.phase
    });

    const gamesWithProgress = games.map((game, index) => {
      const isCompleted = userProgress?.completedGames?.some(
        cg => cg.game.toString() === game._id.toString()
      );

      const isUnlocked = index === 0 || userProgress?.completedGames?.some(
        cg => cg.game.toString() === games[index - 1]._id.toString()
      );

      return {
        ...game.toObject(),
        isCompleted,
        isUnlocked
      };
    });

    res.json(gamesWithProgress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar jogos' });
  }
};

exports.updateGame = async (req, res) => {
  try {
    const { mission, order } = req.body;

    if (order !== undefined) {
      const game = await Game.findById(req.params.id);
      if (!game) {
        return res.status(404).json({ message: 'Jogo não encontrado' });
      }

      const targetMission = mission || game.mission;
      const oldOrder = game.order;
      const newOrder = order;

      if (oldOrder !== newOrder || (mission && mission !== game.mission.toString())) {
        const existingGame = await Game.findOne({ 
          mission: targetMission,
          order: newOrder, 
          _id: { $ne: req.params.id },
          isActive: true 
        });

        if (existingGame) {
          if (newOrder < oldOrder) {
            await Game.updateMany(
              { mission: targetMission, order: { $gte: newOrder, $lt: oldOrder }, _id: { $ne: req.params.id }, isActive: true },
              { $inc: { order: 1 } }
            );
          } else {
            await Game.updateMany(
              { mission: targetMission, order: { $gt: oldOrder, $lte: newOrder }, _id: { $ne: req.params.id }, isActive: true },
              { $inc: { order: -1 } }
            );
          }
        }
      }

      if (mission && mission !== game.mission.toString()) {
        await Game.updateMany(
          { mission: game.mission, order: { $gt: oldOrder }, isActive: true },
          { $inc: { order: -1 } }
        );
      }
    }

    if (mission) {
      const missionExists = await Mission.findById(mission);
      if (!missionExists) {
        return res.status(404).json({ message: 'Missão não encontrada' });
      }

      if (missionExists.type !== 'jogos') {
        return res.status(400).json({ message: 'A missão selecionada não é do tipo "Jogos Educacionais"' });
      }

      const oldGame = await Game.findById(req.params.id);
      if (oldGame && oldGame.mission.toString() !== mission) {
        await Mission.findByIdAndUpdate(oldGame.mission, {
          $pull: { games: oldGame._id }
        });
        await Mission.findByIdAndUpdate(mission, {
          $push: { games: oldGame._id }
        });
      }
    }

    const game = await Game.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!game) {
      return res.status(404).json({ message: 'Jogo não encontrado' });
    }

    res.json(game);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao atualizar jogo' });
  }
};

exports.deleteGame = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({ message: 'Jogo não encontrado' });
    }

    const oldOrder = game.order;
    const missionId = game.mission;

    game.isActive = false;
    await game.save();

    await Game.updateMany(
      { mission: missionId, order: { $gt: oldOrder }, isActive: true },
      { $inc: { order: -1 } }
    );

    res.json({ message: 'Jogo desativado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao deletar jogo' });
  }
};

exports.submitGameScore = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { score } = req.body;

    const game = await Game.findById(gameId).populate('phase').populate('mission');
    if (!game) {
      return res.status(404).json({ message: 'Jogo não encontrado' });
    }

    let userProgress = await UserProgress.findOne({
      user: req.user.id,
      phase: game.phase._id
    });

    if (!userProgress) {
      return res.status(400).json({ 
        message: 'Você precisa assistir o vídeo da fase primeiro!' 
      });
    }

    const alreadyCompleted = userProgress.completedGames.some(
      cg => cg.game.toString() === gameId
    );

    if (alreadyCompleted) {
      return res.status(400).json({ 
        message: 'Você já completou este jogo!',
        alreadyCompleted: true
      });
    }

    const allGames = await Game.find({ 
      mission: game.mission._id, 
      isActive: true 
    }).sort({ order: 1 });

    const gameIndex = allGames.findIndex(g => g._id.toString() === gameId);

    if (gameIndex > 0) {
      const previousGameCompleted = userProgress.completedGames.some(
        cg => cg.game.toString() === allGames[gameIndex - 1]._id.toString()
      );

      if (!previousGameCompleted) {
        return res.status(400).json({ 
          message: 'Você precisa completar o jogo anterior primeiro!' 
        });
      }
    }

    let progress = await Progress.findOne({
      user: req.user.id,
      game: gameId,
    });

    if (!progress) {
      progress = await Progress.create({
        user: req.user.id,
        game: gameId,
        phase: game.phase._id,
        score,
        attempts: 1,
        bestScore: score,
      });
    } else {
      progress.attempts += 1;
      progress.score = score;
      if (score > progress.bestScore) {
        progress.bestScore = score;
      }
    }

    const minimumScore = game.points * 0.7;
    
    if (score >= minimumScore && !progress.completed) {
      progress.completed = true;
      progress.completedAt = new Date();
      await progress.save();

      userProgress.completedGames.push({
        game: gameId,
        completedAt: new Date(),
        score: score,
        attempts: progress.attempts
      });

      const user = await User.findById(req.user.id);
      user.addExperience(game.points);
      await user.save();

      let allMissionGamesCompleted = false;
      const missionGames = await Game.find({ 
        mission: game.mission._id, 
        isActive: true 
      });
      
      const allCompleted = missionGames.every(mg => 
        userProgress.completedGames.some(cg => cg.game.toString() === mg._id.toString())
      );

      if (allCompleted) {
        allMissionGamesCompleted = true;
        
        const missionAlreadyCompleted = userProgress.completedMissions.some(
          cm => cm.mission.toString() === game.mission._id.toString()
        );

        if (!missionAlreadyCompleted) {
          const mission = await Mission.findById(game.mission._id);
          
          userProgress.completedMissions.push({
            mission: game.mission._id,
            completedAt: new Date(),
            score: 100
          });

          user.addExperience(mission.experienceReward);
          user.totalPoints += mission.pointsReward;
          await user.save();
        }
      }

      const allMissions = await Mission.find({ 
        phase: game.phase._id, 
        isActive: true 
      });

      if (userProgress.completedMissions.length >= allMissions.length) {
        userProgress.phaseCompleted = true;
        userProgress.completedAt = new Date();

        const phaseAlreadyCompleted = user.completedPhases.some(
          cp => cp.phase.toString() === game.phase._id.toString()
        );

        if (!phaseAlreadyCompleted) {
          user.completedPhases.push({
            phase: game.phase._id,
            completedAt: new Date()
          });
          
          user.addExperience(game.phase.experienceReward);
          await user.save();
        }
      }

      await userProgress.save();

      const { checkAchievements } = require('./achievementController');
      const newAchievements = await checkAchievements(req.user.id);

      return res.json({
        message: allMissionGamesCompleted 
          ? 'Jogo completado! Missão concluída!' 
          : 'Jogo completado!',
        progress,
        user: {
          level: user.level,
          experience: user.experience,
          totalPoints: user.totalPoints,
        },
        newAchievements,
        missionCompleted: allMissionGamesCompleted
      });
    }

    await progress.save();
    
    res.json({ 
      message: `Pontuação registrada! Você precisa de pelo menos ${Math.round(minimumScore)} pontos para completar.`,
      progress,
      minimumScore: Math.round(minimumScore),
      currentScore: score
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao registrar pontuação', error: error.message });
  }
};
