const twilio = require('twilio');

const client = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

if (!client) {
  console.warn('⚠️  WhatsApp service not ready: Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN');
} else {
  console.log('📱 WhatsApp service ready');
}

// Converts a plain Indian phone number (e.g. "9358634955" or "09358634955")
// into Twilio's required WhatsApp format: "whatsapp:+919358634955"
const formatWhatsAppNumber = (phone) => {
  if (!phone) return null;
  let digits = phone.toString().replace(/\D/g, ''); // strip spaces, dashes, etc.
  digits = digits.replace(/^0+/, ''); // drop a leading 0 if present
  if (digits.length === 10) {
    digits = '91' + digits; // assume Indian number if no country code given
  }
  return `whatsapp:+${digits}`;
};

const itemsListText = (items) =>
  items.map(item => `• ${item.name} (${item.unit}) × ${item.quantity} - ₹${item.price * item.quantity}`).join('\n');

// Safe wrapper - logs failures but never throws, so a broken WhatsApp
// message never breaks the actual order flow
const safeSend = async (toPhone, body) => {
  try {
    if (!client) {
      console.warn('WhatsApp not sent (Twilio not configured)');
      return;
    }
    if (!process.env.TWILIO_WHATSAPP_NUMBER) {
      console.warn('WhatsApp not sent (TWILIO_WHATSAPP_NUMBER not set)');
      return;
    }
    const to = formatWhatsAppNumber(toPhone);
    if (!to) {
      console.warn('📱 Skipped WhatsApp - no recipient phone provided');
      return;
    }

    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER, // e.g. "whatsapp:+14152523886"
      to,
      body
    });
    console.log('📱 WhatsApp sent →', to);
  } catch (error) {
    // Common in Sandbox mode: recipient hasn't joined the sandbox yet
    console.error('📱 WhatsApp send failed:', error.message);
  }
};

// @desc  Sent right after a customer places an order
const sendOrderPlacedWhatsApp = async (phone, order) => {
  const body =
    `🥛 *Milko Bar Dairy*\n\n` +
    `Order Confirmed! ✅\n` +
    `Order #${order._id.toString().slice(-6)}\n\n` +
    `${itemsListText(order.items)}\n\n` +
    `*Total: ₹${order.total}*\n` +
    `Payment: ${order.paymentMethod}\n` +
    `Delivery to: ${order.userAddress}\n\n` +
    `We'll message you again once it's delivered. 🚴`;

  await safeSend(phone, body);
};

// @desc  Sent when an order's status changes to 'Delivered'
const sendOrderDeliveredWhatsApp = async (phone, order) => {
  const body =
    `🥛 *Milko Bar Dairy*\n\n` +
    `Delivered! 🎉\n` +
    `Order #${order._id.toString().slice(-6)} has been delivered.\n\n` +
    `*Total: ₹${order.total}*\n\n` +
    `Thank you for shopping with us! 🙏`;

  await safeSend(phone, body);
};

module.exports = {
  sendOrderPlacedWhatsApp,
  sendOrderDeliveredWhatsApp
};