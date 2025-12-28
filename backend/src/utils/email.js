const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: '587',
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendVerificationEmail = async (email, code) => {
  const mailOptions = {
    from: `"ReCaatinga" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: 'Código de Verificação - ReCaatinga',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d5016;">Bem-vindo ao ReCaatinga!</h2>
        <p>Seu código de verificação é:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2d5016;">
          ${code}
        </div>
        <p>Este código expira em 10 minutos.</p>
        <p>Se você não solicitou este código, ignore este email.</p>
        <hr style="margin-top: 30px;">
        <p style="color: #666; font-size: 12px;">ReCaatinga - Regenerando a Caatinga com Ciência e Tecnologia</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email de verificação enviado para:', email);
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    throw new Error('Erro ao enviar email de verificação');
  }
};

const sendPasswordResetEmail = async (email, resetUrl) => {
  const mailOptions = {
    from: `"ReCaatinga" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: 'Recuperação de Senha - ReCaatinga',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d5016;">Recuperação de Senha</h2>
        <p>Você solicitou a recuperação de senha.</p>
        <p>Clique no link abaixo para redefinir sua senha:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #2d5016; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Redefinir Senha
          </a>
        </div>
        <p>Este link expira em 30 minutos.</p>
        <p>Se você não solicitou isso, ignore este email.</p>
        <hr style="margin-top: 30px;">
        <p style="color: #666; font-size: 12px;">ReCaatinga - Regenerando a Caatinga com Ciência e Tecnologia</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email de recuperação enviado para:', email);
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    throw new Error('Erro ao enviar email de recuperação');
  }
};

const sendTaskApprovedEmail = async (email, userName, missionTitle, experienceReward, pointsReward) => {
  const mailOptions = {
    from: `"ReCaatinga" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: '✅ Tarefa Aprovada - ReCaatinga',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #10b981; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h2 style="margin: 0; font-size: 24px;">🎉 Parabéns, ${userName}!</h2>
        </div>
        <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            Sua tarefa da missão <strong style="color: #2d5016;">${missionTitle}</strong> foi aprovada!
          </p>
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <h3 style="color: #2d5016; margin-top: 0;">Recompensas Recebidas:</h3>
            <p style="margin: 8px 0; font-size: 18px;">
              ⭐ <strong>+${experienceReward} XP</strong>
            </p>
            <p style="margin: 8px 0; font-size: 18px;">
              🏆 <strong>+${pointsReward} Pontos</strong>
            </p>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            Continue assim! Você está ajudando a regenerar a Caatinga! 🌱
          </p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
               style="background-color: #2d5016; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Acessar Plataforma
            </a>
          </div>
        </div>
        <hr style="margin-top: 30px;">
        <p style="color: #666; font-size: 12px; text-align: center;">ReCaatinga - Regenerando a Caatinga com Ciência e Tecnologia</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email de aprovação enviado para:', email);
  } catch (error) {
    console.error('Erro ao enviar email de aprovação:', error);
  }
};

const sendTaskRejectedEmail = async (email, userName, missionTitle, reviewComment) => {
  const mailOptions = {
    from: `"ReCaatinga" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: '❌ Tarefa Rejeitada - ReCaatinga',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #ef4444; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h2 style="margin: 0; font-size: 24px;">Tarefa Não Aprovada</h2>
        </div>
        <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            Olá, ${userName}!
          </p>
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            Infelizmente, sua tarefa da missão <strong style="color: #2d5016;">${missionTitle}</strong> não foi aprovada.
          </p>
          ${reviewComment ? `
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
            <h3 style="color: #2d5016; margin-top: 0;">Comentário do Revisor:</h3>
            <p style="color: #374151; font-size: 15px; line-height: 1.6;">
              ${reviewComment}
            </p>
          </div>
          ` : ''}
          <p style="color: #6b7280; font-size: 14px;">
            Não desanime! Você pode enviar a tarefa novamente com as correções necessárias. 💪
          </p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
               style="background-color: #2d5016; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Enviar Novamente
            </a>
          </div>
        </div>
        <hr style="margin-top: 30px;">
        <p style="color: #666; font-size: 12px; text-align: center;">ReCaatinga - Regenerando a Caatinga com Ciência e Tecnologia</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email de rejeição enviado para:', email);
  } catch (error) {
    console.error('Erro ao enviar email de rejeição:', error);
  }
};

module.exports = { 
  sendVerificationEmail, 
  sendPasswordResetEmail,
  sendTaskApprovedEmail,
  sendTaskRejectedEmail
};