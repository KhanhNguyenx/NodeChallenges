import nodemailer from "nodemailer";

export const sendMail = async (email: string, subject: string, html: string): Promise<void> => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      html,
    });

    console.log("✅ Email sent to:", email);
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    throw error; // để API register biết là gửi mail thất bại
  }
};
