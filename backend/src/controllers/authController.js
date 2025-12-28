const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendVerificationEmail } = require('../utils/email');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email já cadastrado' });
    }

    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000);

    const user = await User.create({
      name,
      email,
      password,
      verificationCode,
      verificationCodeExpires,
    });

    await sendVerificationEmail(email, verificationCode);

    res.status(201).json({
      message: 'Usuário criado. Verifique seu email.',
      userId: user._id,
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ message: 'Erro ao registrar usuário' });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email }).select('+verificationCode +verificationCodeExpires');
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email já verificado' });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ message: 'Código inválido' });
    }

    if (new Date() > user.verificationCodeExpires) {
      return res.status(400).json({ message: 'Código expirado' });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      message: 'Email verificado com sucesso',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        level: user.level,
        totalExperience: user.totalExperience,
        totalPoints: user.totalPoints,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Erro na verificação:', error);
    res.status(500).json({ message: 'Erro ao verificar email' });
  }
};

exports.resendCode = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email }).select('+verificationCode +verificationCodeExpires');
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email já verificado' });
    }

    const verificationCode = generateVerificationCode();
    user.verificationCode = verificationCode;
    user.verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(email, verificationCode);

    res.json({ message: 'Novo código enviado' });
  } catch (error) {
    console.error('Erro ao reenviar código:', error);
    res.status(500).json({ message: 'Erro ao reenviar código' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password +verificationCode +verificationCodeExpires');
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    if (!user.isVerified) {
      const codeExpired = !user.verificationCodeExpires || new Date() > user.verificationCodeExpires;
      
      if (codeExpired) {
        const verificationCode = generateVerificationCode();
        user.verificationCode = verificationCode;
        user.verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();
        await sendVerificationEmail(email, verificationCode);
      }

      return res.status(403).json({ 
        message: 'Email não verificado',
        requiresVerification: true,
        email: user.email,
        newCodeSent: codeExpired
      });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        level: user.level,
        totalExperience: user.totalExperience,
        totalPoints: user.totalPoints,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro ao fazer login' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ message: 'Erro ao buscar usuário' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, avatar } = req.body;
    
    console.log('Dados recebidos para atualização:', { name, email, avatar });
    console.log('ID do usuário:', req.user.id);

    const user = await User.findById(req.user.id);

    if (!user) {
      console.log('Usuário não encontrado:', req.user.id);
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    if (email && email !== user.email) {
      console.log('Tentando mudar email de', user.email, 'para', email);
      
      const emailExists = await User.findOne({ email, _id: { $ne: user._id } });
      if (emailExists) {
        console.log('Email já está em uso:', email);
        return res.status(400).json({ message: 'Email já está em uso' });
      }
      
      user.email = email;
    }

    if (name && name.trim() !== '') {
      console.log('Atualizando nome para:', name);
      user.name = name.trim();
    }

    if (avatar) {
      console.log('Atualizando avatar para:', avatar);
      user.avatar = avatar;
    }

    console.log('Salvando alterações...');
    await user.save();
    
    console.log('Perfil atualizado com sucesso');

    res.json({
      message: 'Perfil atualizado com sucesso',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        level: user.level,
        totalExperience: user.totalExperience,
        totalPoints: user.totalPoints,
        avatar: user.avatar,
      }
    });
  } catch (error) {
    console.error('Erro detalhado ao atualizar perfil:', error);
    console.error('Stack trace:', error.stack);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Erro de validação', 
        errors: messages 
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Email já está em uso' 
      });
    }
    
    res.status(500).json({ 
      message: 'Erro ao atualizar perfil',
      error: error.message 
    });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Senhas são obrigatórias' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Nova senha deve ter pelo menos 6 caracteres' });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Senha atual incorreta' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Senha atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    res.status(500).json({ message: 'Erro ao atualizar senha' });
  }
};
