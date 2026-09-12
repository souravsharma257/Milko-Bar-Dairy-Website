const nodemailer = require('nodemailer');

// Gmail SMTP transporter - uses EMAIL_USER and EMAIL_PASSWORD from .env
// (EMAIL_PASSWORD must be a Gmail "App Password", not your regular password)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Verify connection on startup (logs a warning if credentials are wrong,
// but never crashes the server because of it)
transporter.verify((error) => {
  if (error) {
    console.warn('⚠️  Email service not ready:', error.message);
  } else {
    console.log('📧 Email service ready');
  }
});

const BRAND_COLOR = '#1769e0';
const BRAND_NAME = 'Milko Bar Dairy';

// Shared wrapper so every email looks consistent
const wrapEmailBody = (title, bodyHtml) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8faf9;">
    <div style="background: linear-gradient(135deg, ${BRAND_COLOR}, #0f7a4d); padding: 24px; text-align: center;">
      <div style="font-size: 32px;">🥛</div>
      <h1 style="color: white; margin: 8px 0 0; font-size: 20px;">${BRAND_NAME}</h1>
    </div>
    <div style="background: white; padding: 24px; margin: 0;">
      <h2 style="color: #1f2937; margin-top: 0;">${title}</h2>
      ${bodyHtml}
    </div>
    <div style="text-align: center; padding: 16px; color: #9ca3af; font-size: 12px;">
      ${BRAND_NAME} · Fresh dairy, delivered<br/>
      This is an automated email, please do not reply.
    </div>
  </div>
`;

const itemsListHtml = (items) => `
  <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
    ${items.map(item => `
      <tr style="border-bottom: 1px solid #f0f0f0;">
        <td style="padding: 8px 0; color: #374151;">${item.name} (${item.unit}) × ${item.quantity}</td>
        <td style="padding: 8px 0; text-align: right; color: #374151;">₹${item.price * item.quantity}</td>
      </tr>
    `).join('')}
  </table>
`;

// Safe wrapper - logs failures but never throws, so a broken email never
// breaks the actual order flow
const safeSend = async (mailOptions) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('Email not sent (EMAIL_USER/EMAIL_PASSWORD not set):', mailOptions.subject);
      return;
    }
    await transporter.sendMail(mailOptions);
    console.log('📧 Email sent:', mailOptions.subject, '→', mailOptions.to);
  } catch (error) {
    console.error('📧 Email send failed:', error.message);
  }
};

// @desc  Sent right after a customer places an order
const sendOrderPlacedEmail = async (toEmail, order) => {
  if (!toEmail) { console.warn('📧 Skipped email - no recipient address provided'); return; }

  const html = wrapEmailBody(
    `Order Confirmed! ✅`,
    `
      <p style="color: #4b5563;">Hi ${order.userName},</p>
      <p style="color: #4b5563;">Thanks for your order! Here's a quick summary:</p>
      <p style="color: #6b7280; font-size: 14px;"><strong>Order #${order._id.toString().slice(-6)}</strong></p>
      ${itemsListHtml(order.items)}
      <p style="text-align: right; font-size: 18px; font-weight: bold; color: #1f2937;">Total: ₹${order.total}</p>
      <p style="color: #4b5563;"><strong>Delivery Address:</strong> ${order.userAddress}</p>
      <p style="color: #4b5563;"><strong>Payment Method:</strong> ${order.paymentMethod}</p>
      <p style="margin-top: 24px; color: #4b5563;">We'll notify you again once your order is delivered. 🚴</p>
    `
  );

  await safeSend({
    from: `"${BRAND_NAME}" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Order Confirmed - #${order._id.toString().slice(-6)}`,
    html
  });
};

// @desc  Sent when an order's status changes to 'Delivered'
const sendOrderDeliveredEmail = async (toEmail, order) => {
  if (!toEmail) { console.warn('📧 Skipped email - no recipient address provided'); return; }

  const html = wrapEmailBody(
    `Delivered! 🎉`,
    `
      <p style="color: #4b5563;">Hi ${order.userName},</p>
      <p style="color: #4b5563;">Your order has been delivered. We hope you enjoy your fresh dairy products!</p>
      <p style="color: #6b7280; font-size: 14px;"><strong>Order #${order._id.toString().slice(-6)}</strong></p>
      ${itemsListHtml(order.items)}
      <p style="text-align: right; font-size: 18px; font-weight: bold; color: #1f2937;">Total: ₹${order.total}</p>
      <p style="margin-top: 24px; color: #4b5563;">Thank you for shopping with ${BRAND_NAME}! 🥛</p>
    `
  );

  await safeSend({
    from: `"${BRAND_NAME}" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Delivered - Order #${order._id.toString().slice(-6)}`,
    html
  });
};

module.exports = {
  sendOrderPlacedEmail,
  sendOrderDeliveredEmail
};