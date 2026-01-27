const Mission = require('../models/Mission');
const Phase = require('../models/Phase');

exports.createMission = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      phase, 
      order, 
      type, 
      videoUrl, 
      suggestedVideos, 
      taskDetails, 
      photoTask,
      formTask,
      textTask,
      experienceReward,
      pointsReward 
    } = req.body;

    const phaseExists = await Phase.findById(phase);
    if (!phaseExists) {
      return res.status(404).json({ message: 'Fase não encontrada' });
    }

    let finalOrder = order;
    if (!finalOrder) {
      const maxMission = await Mission.findOne({ phase }).sort({ order: -1 }).select('order');
      finalOrder = maxMission ? maxMission.order + 1 : 1;
    } else {
      const existingMission = await Mission.findOne({ phase, order: finalOrder });
      if (existingMission) {
        await Mission.updateMany(
          { phase, order: { $gte: finalOrder } },
          { $inc: { order: 1 } }
        );
      }
    }

    const missionData = {
      title,
      description,
      phase,
      order: finalOrder,
      type,
      experienceReward: experienceReward || 50,
      pointsReward: pointsReward || 10
    };

    if (type === 'video') {
      missionData.videoUrl = videoUrl;
      missionData.suggestedVideos = suggestedVideos;
    }

    if (type === 'foto') {
      if (photoTask) {
        missionData.photoTask = photoTask;
        missionData.taskDetails = photoTask;
      } else if (taskDetails) {
        missionData.taskDetails = taskDetails;
        missionData.photoTask = taskDetails;
      } else {
        missionData.photoTask = {
          instructions: description,
          requiresPhoto: true,
          requiresLocation: false
        };
        missionData.taskDetails = missionData.photoTask;
      }
    }

    if (type === 'formulario' && formTask) {
      missionData.formTask = formTask;
    }

    if (type === 'texto' && textTask) {
      missionData.textTask = textTask;
    }

    const mission = await Mission.create(missionData);

    await Phase.findByIdAndUpdate(phase, {
      $push: { missions: mission._id }
    });

    res.status(201).json(mission);
  } catch (error) {
    console.error('Erro ao criar missão:', error);
    res.status(500).json({ message: 'Erro ao criar missão', error: error.message });
  }
};

exports.getMissionsByPhase = async (req, res) => {
  try {
    const missions = await Mission.find({ 
      phase: req.params.phaseId,
      isActive: true 
    })
    .populate('games')
    .sort({ order: 1 });

    res.json(missions);
  } catch (error) {
    console.error('Erro ao buscar missões:', error);
    res.status(500).json({ message: 'Erro ao buscar missões' });
  }
};

exports.getMissionById = async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id)
      .populate('phase')
      .populate('games');

    if (!mission) {
      return res.status(404).json({ message: 'Missão não encontrada' });
    }

    if (mission.type === 'foto') {
      if (mission.photoTask && !mission.taskDetails) {
        mission.taskDetails = mission.photoTask;
      } else if (mission.taskDetails && !mission.photoTask) {
        mission.photoTask = mission.taskDetails;
      }
    }

    res.json(mission);
  } catch (error) {
    console.error('Erro ao buscar missão:', error);
    res.status(500).json({ message: 'Erro ao buscar missão' });
  }
};

exports.updateMission = async (req, res) => {
  try {
    const { taskDetails, photoTask, type, order, phase } = req.body;

    if (order !== undefined) {
      const mission = await Mission.findById(req.params.id);
      if (!mission) {
        return res.status(404).json({ message: 'Missão não encontrada' });
      }

      const targetPhase = phase || mission.phase;
      const oldOrder = mission.order;
      const newOrder = order;

      if (oldOrder !== newOrder || (phase && phase !== mission.phase.toString())) {
        const existingMission = await Mission.findOne({ 
          phase: targetPhase,
          order: newOrder, 
          _id: { $ne: req.params.id },
          isActive: true 
        });

        if (existingMission) {
          if (newOrder < oldOrder) {
            await Mission.updateMany(
              { phase: targetPhase, order: { $gte: newOrder, $lt: oldOrder }, _id: { $ne: req.params.id }, isActive: true },
              { $inc: { order: 1 } }
            );
          } else {
            await Mission.updateMany(
              { phase: targetPhase, order: { $gt: oldOrder, $lte: newOrder }, _id: { $ne: req.params.id }, isActive: true },
              { $inc: { order: -1 } }
            );
          }
        }
      }

      if (phase && phase !== mission.phase.toString()) {
        await Mission.updateMany(
          { phase: mission.phase, order: { $gt: oldOrder }, isActive: true },
          { $inc: { order: -1 } }
        );
      }
    }

    if (type === 'foto') {
      if (photoTask && !taskDetails) {
        req.body.taskDetails = photoTask;
      } else if (taskDetails && !photoTask) {
        req.body.photoTask = taskDetails;
      }
    }

    const mission = await Mission.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('phase')
    .populate('games');

    if (!mission) {
      return res.status(404).json({ message: 'Missão não encontrada' });
    }

    res.json(mission);
  } catch (error) {
    console.error('Erro ao atualizar missão:', error);
    res.status(500).json({ message: 'Erro ao atualizar missão' });
  }
};

exports.deleteMission = async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id);

    if (!mission) {
      return res.status(404).json({ message: 'Missão não encontrada' });
    }

    const oldOrder = mission.order;
    const phaseId = mission.phase;

    mission.isActive = false;
    await mission.save();

    await Mission.updateMany(
      { phase: phaseId, order: { $gt: oldOrder }, isActive: true },
      { $inc: { order: -1 } }
    );

    res.json({ message: 'Missão desativada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar missão:', error);
    res.status(500).json({ message: 'Erro ao deletar missão' });
  }
};
