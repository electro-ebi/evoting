import nodemailer from "nodemailer";

export const sendOTP = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", // or your SMTP service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"E-Voting System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Verification Code - E-Voting System",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #7c3aed, #ec4899); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">E-Voting System</h1>
          </div>
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #374151; margin-bottom: 20px;">Email Verification</h2>
            <p style="color: #6b7280; margin-bottom: 20px;">
              Thank you for registering with our E-Voting System. To complete your registration, 
              please verify your email address using the code below:
            </p>
            <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h3 style="color: #7c3aed; font-size: 32px; letter-spacing: 8px; margin: 0; font-family: monospace;">
                ${otp}
              </h3>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              This code will expire in 5 minutes. If you didn't request this verification, 
              please ignore this email.
            </p>
          </div>
          <div style="background: #f3f4f6; padding: 15px; text-align: center; color: #6b7280; font-size: 12px;">
            © ${new Date().getFullYear()} E-Voting System. All rights reserved.
          </div>
        </div>
      `,
      text: `Your OTP verification code is: ${otp}. This code will expire in 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent successfully to ${email}`);
  } catch (error) {
    console.error("❌ Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};
