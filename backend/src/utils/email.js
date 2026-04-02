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
      from: '"Otomate Support" <support@otomate.com>', // sender address
      to: toEmail, // list of receivers
      subject: "Khôi phục mật khẩu - Otomate", // Subject line
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-w-lg; margin: auto;">
          <h2>Yêu cầu đặt lại mật khẩu</h2>
          <p>Xin chào,</p>
          <p>Bạn nhận được email này vì chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản Otomate của bạn.</p>
          <p>Vui lòng click vào đường link bên dưới để đặt lại mật khẩu (link có hiệu lực trong 15 phút):</p>
          <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; color: white; background-color: #4153b4; text-decoration: none; border-radius: 5px;">Đặt lại mật khẩu</a>
          <p>Nếu nút bấm không hoạt động, bạn có thể copy và dán đoạn link sau vào trình duyệt:</p>
          <p><a href="${resetLink}">${resetLink}</a></p>
          <p>Nếu bạn không yêu cầu đặt lại mật khẩu, xin vui lòng bỏ qua email này.</p>
          <p>Trân trọng,<br>Đội ngũ Otomate</p>
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
