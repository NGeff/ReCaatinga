const TaskSubmission = require('../models/TaskSubmission');
const Mission = require('../models/Mission');
const User = require('../models/User');
const UserProgress = require('../models/UserProgress');
const { sendTaskApprovedEmail, sendTaskRejectedEmail } = require('../utils/email');
const { sendTaskNotification } = require('../utils/notifications');

exports.submitTask = async (req, res) => {
  try {
    const { missionId, type, description, location, photoUrl, unableReason, formAnswers, textContent } = req.body;

    const mission = await Mission.findById(missionId).populate('phase');
    if (!mission) {
      return res.status(404).json({ message: 'Missão não encontrada' });
    }

    const existingApproved = await TaskSubmission.findOne({
      user: req.user.id,
      mission: missionId,
      status: 'approved'
    });

    if (existingApproved) {
      return res.status(400).json({ 
        message: 'Você já completou esta missão!',
        alreadyCompleted: true
      });
    }

    const existingPending = await TaskSubmission.findOne({
      user: req.user.id,
      mission: missionId,
      status: 'pending'
    });

    if (existingPending) {
      return res.status(400).json({ 
        message: 'Você já tem uma submissão pendente para esta missão. Aguarde a análise do administrador.',
        hasPending: true
      });
    }

    const submissionData = {
      user: req.user.id,
      mission: missionId,
      phase: mission.phase._id,
      type
    };

    if (type === 'completed') {
      if (!photoUrl) {
        return res.status(400).json({ message: 'URL da foto é obrigatória' });
      }
      
      submissionData.photoUrl = photoUrl;
      
      if (description) {
        submissionData.description = description;
      }
      
      if (location) {
        if (typeof location === 'string') {
          submissionData.location = { address: location };
        } else {
          submissionData.location = location;
        }
      }
    } else if (type === 'unable') {
      if (!unableReason) {
        return res.status(400).json({ message: 'Motivo é obrigatório' });
      }
      submissionData.unableReason = unableReason;
      submissionData.status = 'approved';
    } else if (type === 'form') {
      if (!formAnswers || formAnswers.length === 0) {
        return res.status(400).json({ message: 'Respostas do formulário são obrigatórias' });
      }
      submissionData.formAnswers = formAnswers;
    } else if (type === 'text') {
      if (!textContent || !textContent.text) {
        return res.status(400).json({ message: 'Texto é obrigatório' });
      }
      
      const minWords = mission.textTask?.minWords || 50;
      const maxWords = mission.textTask?.maxWords || 500;
      
      if (textContent.wordCount < minWords) {
        return res.status(400).json({ 
          message: `O texto deve ter no mínimo ${minWords} palavras. Você enviou ${textContent.wordCount} palavras.`
        });
      }
      
      if (textContent.wordCount > maxWords) {
        return res.status(400).json({ 
          message: `O texto deve ter no máximo ${maxWords} palavras. Você enviou ${textContent.wordCount} palavras.`
        });
      }
      
      submissionData.textContent = textContent;
    }

    const submission = await TaskSubmission.create(submissionData);

    if (type === 'unable') {
      return res.json({
        message: 'Resposta registrada. Tente novamente mais tarde!',
        submission
      });
    }

    res.status(201).json({
      message: 'Tarefa enviada para análise com sucesso!',
      submission
    });
  } catch (error) {
    console.error('Erro ao enviar tarefa:', error);
    res.status(500).json({ message: 'Erro ao enviar tarefa', error: error.message });
  }
};

exports.getPendingTasks = async (req, res) => {
  try {
    const tasks = await TaskSubmission.find({ status: 'pending' })
      .populate('user', 'name email avatar')
      .populate({
        path: 'mission',
        select: 'title description experienceReward pointsReward photoTask taskDetails formTask textTask type',
        populate: {
          path: 'phase',
          select: 'title'
        }
      })
      .sort({ createdAt: -1 });

    const tasksWithDetails = tasks.map(task => {
      const taskObj = task.toObject();
      
      if (task.mission) {
        if (task.mission.type === 'foto') {
          const photoTaskInfo = task.mission.photoTask || task.mission.taskDetails || {};
          taskObj.mission.instructions = photoTaskInfo.instructions || task.mission.description;
          taskObj.mission.exampleImage = photoTaskInfo.exampleImage;
          taskObj.mission.requiresPhoto = photoTaskInfo.requiresPhoto;
          taskObj.mission.requiresLocation = photoTaskInfo.requiresLocation;
        } else if (task.mission.type === 'formulario') {
          taskObj.mission.instructions = task.mission.formTask?.instructions || task.mission.description;
          taskObj.mission.questions = task.mission.formTask?.questions || [];
        } else if (task.mission.type === 'texto') {
          taskObj.mission.instructions = task.mission.textTask?.instructions || task.mission.description;
          taskObj.mission.minWords = task.mission.textTask?.minWords;
          taskObj.mission.maxWords = task.mission.textTask?.maxWords;
          taskObj.mission.topics = task.mission.textTask?.topics;
        }
      }

      return taskObj;
    });

    res.json(tasksWithDetails);
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error);
    res.status(500).json({ message: 'Erro ao buscar tarefas pendentes' });
  }
};

exports.getMySubmissions = async (req, res) => {
  try {
    const submissions = await TaskSubmission.find({ user: req.user.id })
      .populate({
        path: 'mission',
        select: 'title description experienceReward pointsReward photoTask taskDetails formTask textTask type',
        populate: {
          path: 'phase',
          select: 'title'
        }
      })
      .sort({ createdAt: -1 });

    const submissionsWithDetails = submissions.map(sub => {
      const subObj = sub.toObject();
      
      if (sub.mission) {
        if (sub.mission.type === 'foto') {
          const photoTaskInfo = sub.mission.photoTask || sub.mission.taskDetails || {};
          subObj.mission.instructions = photoTaskInfo.instructions || sub.mission.description;
          subObj.mission.exampleImage = photoTaskInfo.exampleImage;
        } else if (sub.mission.type === 'formulario') {
          subObj.mission.instructions = sub.mission.formTask?.instructions || sub.mission.description;
        } else if (sub.mission.type === 'texto') {
          subObj.mission.instructions = sub.mission.textTask?.instructions || sub.mission.description;
        }
      }

      return subObj;
    });

    res.json(submissionsWithDetails);
  } catch (error) {
    console.error('Erro ao buscar submissões:', error);
    res.status(500).json({ message: 'Erro ao buscar submissões' });
  }
};

exports.reviewTask = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { status, reviewComment } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status inválido' });
    }

    const submission = await TaskSubmission.findById(submissionId)
      .populate('mission')
      .populate('user')
      .populate('phase');

    if (!submission) {
      return res.status(404).json({ message: 'Submissão não encontrada' });
    }

    if (submission.status !== 'pending') {
      return res.status(400).json({ message: 'Esta submissão já foi revisada' });
    }

    submission.status = status;
    submission.reviewedBy = req.user.id;
    submission.reviewedAt = new Date();
    if (reviewComment) {
      submission.reviewComment = reviewComment;
    }
    await submission.save();

    if (status === 'approved') {
      let userProgress = await UserProgress.findOne({
        user: submission.user._id,
        phase: submission.phase._id
      });

      if (!userProgress) {
        userProgress = await UserProgress.create({
          user: submission.user._id,
          phase: submission.phase._id,
          videoWatched: true
        });
      }

      const alreadyCompleted = userProgress.completedMissions.some(
        cm => cm.mission.toString() === submission.mission._id.toString()
      );

      if (!alreadyCompleted) {
        userProgress.completedMissions.push({
          mission: submission.mission._id,
          completedAt: new Date(),
          score: 100
        });

        const user = await User.findById(submission.user._id);
        user.addExperience(submission.mission.experienceReward);
        user.totalPoints += submission.mission.pointsReward;

        const allMissions = await Mission.find({ 
          phase: submission.phase._id, 
          isActive: true 
        });

        let phaseCompletedNow = false;
        if (userProgress.completedMissions.length >= allMissions.length) {
          userProgress.phaseCompleted = true;
          userProgress.completedAt = new Date();

          const phaseAlreadyCompleted = user.completedPhases && user.completedPhases.some(
            cp => cp.phase.toString() === submission.phase._id.toString()
          );

          if (!phaseAlreadyCompleted) {
            const Phase = require('../models/Phase');
            const phase = await Phase.findById(submission.phase._id);

            user.completedPhases.push({
              phase: submission.phase._id,
              completedAt: new Date(),
              badge: phase.badge,
              badgeTitle: phase.badgeTitle
            });

            user.addBadge({
              badge: phase.badge,
              title: phase.badgeTitle,
              description: phase.badgeDescription || `Completou a fase: ${phase.title}`,
              phase: phase._id
            });

            user.addExperience(phase.experienceReward);
            user.totalPoints += phase.pointsReward || 0;

            phaseCompletedNow = true;
          }
        }

        await user.save();
        await userProgress.save();

        const { checkAchievements } = require('./achievementController');
        await checkAchievements(submission.user._id);

        try {
          await sendTaskApprovedEmail(
            submission.user.email,
            submission.user.name,
            submission.mission.title,
            submission.mission.experienceReward,
            submission.mission.pointsReward,
            phaseCompletedNow ? {
              badge: submission.phase.badge || '/badges/default-phase.png',
              title: submission.phase.badgeTitle || 'Badge de Fase',
              phaseName: submission.phase.title
            } : null
          );

          await sendTaskNotification(
            submission.user._id,
            'approved',
            submission.mission.title,
            {
              experienceReward: submission.mission.experienceReward,
              pointsReward: submission.mission.pointsReward
            }
          );
        } catch (emailError) {
          console.error('Erro ao enviar notificações de aprovação:', emailError);
        }
      }
    } else if (status === 'rejected') {
      try {
        await sendTaskRejectedEmail(
          submission.user.email,
          submission.user.name,
          submission.mission.title,
          reviewComment || 'A tarefa não atende aos requisitos necessários.'
        );

        await sendTaskNotification(
          submission.user._id,
          'rejected',
          submission.mission.title,
          {
            reviewComment: reviewComment || 'A tarefa não atende aos requisitos necessários.'
          }
        );
      } catch (emailError) {
        console.error('Erro ao enviar notificações de rejeição:', emailError);
      }
    }

    res.json({
      message: status === 'approved' ? 'Tarefa aprovada!' : 'Tarefa rejeitada',
      submission
    });
  } catch (error) {
    console.error('Erro ao revisar tarefa:', error);
    res.status(500).json({ message: 'Erro ao revisar tarefa' });
  }
};

exports.getSubmissionById = async (req, res) => {
  try {
    const submission = await TaskSubmission.findById(req.params.id)
      .populate('user', 'name email avatar')
      .populate({
        path: 'mission',
        select: 'title description experienceReward pointsReward photoTask taskDetails formTask textTask type',
        populate: {
          path: 'phase',
          select: 'title'
        }
      })
      .populate('reviewedBy', 'name');

    if (!submission) {
      return res.status(404).json({ message: 'Submissão não encontrada' });
    }

    const submissionObj = submission.toObject();
    
    if (submission.mission) {
      if (submission.mission.type === 'foto') {
        const photoTaskInfo = submission.mission.photoTask || submission.mission.taskDetails || {};
        submissionObj.mission.instructions = photoTaskInfo.instructions || submission.mission.description;
        submissionObj.mission.exampleImage = photoTaskInfo.exampleImage;
      } else if (submission.mission.type === 'formulario') {
        submissionObj.mission.instructions = submission.mission.formTask?.instructions || submission.mission.description;
      } else if (submission.mission.type === 'texto') {
        submissionObj.mission.instructions = submission.mission.textTask?.instructions || submission.mission.description;
      }
    }

    res.json(submissionObj);
  } catch (error) {
    console.error('Erro ao buscar submissão:', error);
    res.status(500).json({ message: 'Erro ao buscar submissão' });
  }
};
