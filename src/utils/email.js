async function sendVerificationEmail(to, verificationCode) {
  try {
    await strapi.plugins['email'].services.email.send({
      to,
      subject: 'Email Verification',
      text: `Your verification code is: ${verificationCode}`,
    });
  } catch (err) {
    throw new Error('Failed to send verification email');
  }
}

module.exports = {
  sendVerificationEmail,
};
