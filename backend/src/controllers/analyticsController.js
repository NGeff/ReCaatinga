const User = require('../models/User');
const Phase = require('../models/Phase');
const Game = require('../models/Game');
const Progress = require('../models/Progress');
const UserProgress = require('../models/UserProgress');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const totalPhases = await Phase.countDocuments({ isActive: true });
    const totalGames = await Game.countDocuments({ isActive: true });
    
    const usersLast7Days = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    const totalCompletedGames = await Progress.countDocuments({ completed: true });
    
    const avgLevelResult = await User.aggregate([
      { $match: { isVerified: true } },
      { $group: { _id: null, avgLevel: { $avg: '$level' } } }
    ]);

    const topCategories = await Phase.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const gameCompletionByPhase = await Progress.aggregate([
      { $match: { completed: true } },
      { $group: { _id: '$phase', completions: { $sum: 1 } } },
      {
        $lookup: {
          from: 'phases',
          localField: '_id',
          foreignField: '_id',
          as: 'phaseInfo'
        }
      },
      { $unwind: { path: '$phaseInfo', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          phase: { $ifNull: ['$phaseInfo.title', 'Desconhecido'] },
          completions: 1
        }
      },
      { $sort: { completions: -1 } },
      { $limit: 10 }
    ]);

    const levelDistribution = await User.aggregate([
      { $match: { isVerified: true } },
      { $group: { _id: '$level', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const activeUsersCount = await User.countDocuments({
      'statistics.lastActiveDate': {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    });

    res.json({
      overview: {
        totalUsers,
        verifiedUsers,
        totalPhases,
        totalGames,
        usersLast7Days,
        totalCompletedGames,
        avgLevel: avgLevelResult[0]?.avgLevel?.toFixed(1) || 0,
        activeUsers: activeUsersCount
      },
      topCategories,
      userGrowth,
      gameCompletionByPhase,
      levelDistribution
    });
  } catch (error) {
    console.error('Erro ao buscar analytics:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar analytics',
      error: error.message 
    });
  }
};
