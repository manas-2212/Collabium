import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
})

export const sendOTPEmail = async (
  to: string,
  otp: string
): Promise<void> => {
  await transporter.sendMail({
    from: `"RUnite" <${process.env.MAIL_USER}>`,
    to,
    subject: 'Your RUnite verification code',
    html: `
      <h2>Welcome to RUnite</h2>
      <p>Your verification code is:</p>
      <h1 style="letter-spacing: 8px;">${otp}</h1>
      <p>This code expires in 10 minutes.</p>
    `
  })
}