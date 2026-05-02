import nodemailer from "nodemailer";
import { env } from "../config/env";

const isEmailConfigured = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);

let transporter: nodemailer.Transporter | null = null;

if (isEmailConfigured) {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT),
    secure: Number(env.SMTP_PORT) === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS
    }
  });
}

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (payload: EmailPayload): Promise<void> => {
  if (!transporter) {
    // eslint-disable-next-line no-console
    console.warn("SMTP not configured. Email not sent:", { to: payload.to, subject: payload.subject });
    return;
  }

  await transporter.sendMail({
    from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
    to: payload.to,
    subject: payload.subject,
    html: payload.html
  });
};

export const sendVerificationEmail = async (email: string, token: string): Promise<void> => {
  const verificationUrl = `${env.CLIENT_ORIGIN}/verify-email?token=${token}`;
  await sendEmail({
    to: email,
    subject: "Verify Your HavenHive Email",
    html: `
      <h2>Welcome to HavenHive!</h2>
      <p>Please verify your email address by clicking the button below:</p>
      <a href="${verificationUrl}" style="display:inline-block; padding:10px 20px; background:#007bff; color:white; text-decoration:none; border-radius:5px;">
        Verify Email
      </a>
      <p>Or copy this link: <code>${verificationUrl}</code></p>
      <p>This link expires in 24 hours.</p>
    `
  });
};

export const sendPasswordResetEmail = async (email: string, token: string): Promise<void> => {
  const resetUrl = `${env.CLIENT_ORIGIN}/reset-password?token=${token}`;
  await sendEmail({
    to: email,
    subject: "Reset Your HavenHive Password",
    html: `
      <h2>Password Reset Request</h2>
      <p>Click the button below to reset your password:</p>
      <a href="${resetUrl}" style="display:inline-block; padding:10px 20px; background:#dc3545; color:white; text-decoration:none; border-radius:5px;">
        Reset Password
      </a>
      <p>Or copy this link: <code>${resetUrl}</code></p>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `
  });
};

export const sendBookingConfirmationEmail = async (email: string, propertyTitle: string): Promise<void> => {
  await sendEmail({
    to: email,
    subject: "Booking Confirmation - HavenHive",
    html: `
      <h2>Booking Confirmed!</h2>
      <p>Your booking for <strong>${propertyTitle}</strong> has been received.</p>
      <p>An agent will contact you shortly to confirm the details.</p>
      <p>Thank you for choosing HavenHive!</p>
    `
  });
};
