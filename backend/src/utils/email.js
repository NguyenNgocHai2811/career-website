const nodemailer = require('nodemailer');

/**
 * Cấu hình transporter cho Nodemailer.
 * Mặc định sử dụng Ethereal Email để test nếu không có cấu hình thật.
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/**
 * Gửi email đặt lại mật khẩu
 * @param {string} toEmail Địa chỉ email người nhận
 * @param {string} resetLink Link đặt lại mật khẩu chứa token
 */
const sendResetPasswordEmail = async (toEmail, resetLink) => {
  try {
    const info = await transporter.sendMail({
      from: '"KorraCareers Support" <support@korracareers.com>',
      to: toEmail,
      subject: "Khôi phục mật khẩu - KorraCareers",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 520px; margin: auto; color: #2d3748;">
          <div style="text-align: center; padding: 32px 0 16px;">
            <span style="display: inline-block; background: #ede9fe; border-radius: 12px; padding: 12px 16px; font-size: 24px;">◆</span>
            <h2 style="margin: 12px 0 0; font-size: 20px; color: #4153b4;">Korra<span style="font-weight: 300;">Careers</span></h2>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px;">
            <h3 style="margin: 0 0 12px; font-size: 18px;">Yêu cầu đặt lại mật khẩu</h3>
            <p style="margin: 0 0 8px;">Xin chào,</p>
            <p style="margin: 0 0 20px; color: #4a5568;">Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản KorraCareers của bạn. Link có hiệu lực trong <strong>15 phút</strong>.</p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${resetLink}" style="display: inline-block; padding: 12px 28px; color: white; background-color: #4153b4; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 15px;">Đặt lại mật khẩu</a>
            </div>
            <p style="color: #718096; font-size: 13px;">Nếu nút không hoạt động, copy link sau vào trình duyệt:</p>
            <p style="font-size: 12px; word-break: break-all;"><a href="${resetLink}" style="color: #4153b4;">${resetLink}</a></p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
            <p style="color: #a0aec0; font-size: 12px; margin: 0;">Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.</p>
          </div>
          <p style="text-align: center; color: #a0aec0; font-size: 12px; margin-top: 20px;">Trân trọng, đội ngũ KorraCareers</p>
        </div>
      `,
    });

    console.log("Message sent: %s", info.messageId);

    // In ra preview URL nếu dùng Ethereal (để tiện test local)
    if (info.messageId && process.env.NODE_ENV !== 'production' && !process.env.SMTP_HOST) {
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
    return info;
  } catch (error) {
    console.error("Error sending email: ", error);
    throw error;
  }
};

module.exports = {
  sendResetPasswordEmail
};
