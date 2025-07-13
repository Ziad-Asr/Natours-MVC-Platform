const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: 'Elites Websites <info@eliteswebsites.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: `<p>Forgot your password? Click <a href="${options.resetURL}">here</a> to reset your password.</p>
           <p>If you did not request this, please ignore this email.</p>`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
