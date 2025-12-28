const User = require('../models/User');

exports.getTopUsers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const topUsers = await User.find({ isVerified: true })
      .select('name level totalPoints avatar')
      .sort({ totalPoints: -1, level: -1 })
      .limit(limit);

    const ranking = topUsers.map((user, index) => ({
      position: index + 1,
      id: user._id,
      name: user.name,
      level: user.level,
      totalPoints: user.totalPoints,
      avatar: user.avatar,
    }));

    res.json(ranking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar ranking' });
  }
};

exports.getUserRank = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const higherRanked = await User.countDocuments({
      isVerified: true,
      $or: [
        { totalPoints: { $gt: user.totalPoints } },
        { 
          totalPoints: user.totalPoints,
          level: { $gt: user.level }
        }
      ]
    });

    const position = higherRanked + 1;

    res.json({
      position,
      totalUsers: await User.countDocuments({ isVerified: true }),
      user: {
        name: user.name,
        level: user.level,
        totalPoints: user.totalPoints,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar posição do usuário' });
  }
};