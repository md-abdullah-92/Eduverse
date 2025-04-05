const nodemailer = require("nodemailer");
const crypto = require("crypto");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP for Email Verification - EduVerse",
    html: `<h2>Welcome to EduVerse!</h2>
           <p>Your OTP for email verification is: <strong>${otp}</strong></p>
           <p>This OTP will expire in 5 minutes.</p>`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error(`Failed to send OTP: ${error.message}`);
    throw error;
  }
};

const sendMail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html
    });
    console.log(`Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error(`Failed to send email: ${error.message}`);
    throw error;
  }
};

module.exports = { sendMail, sendOTP, generateOTP };
