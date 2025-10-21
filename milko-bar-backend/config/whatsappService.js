const axios = require('axios');

// MSG91 WhatsApp Service
const sendWhatsAppMessage = async (phone, message) => {
  const apiKey = process.env.WHATSAPP_API_KEY;
  
  if (!apiKey) {
    console.log('⚠️  WhatsApp Service: Not configured (API key missing)');
    return { success: false, message: 'WhatsApp API key not configured' };
  }

  try {
    const url = 'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/';
    
    const formattedPhone = phone.replace(/^\+?91/, '');
    const fullPhone = `91${formattedPhone}`;

    const payload = {
      integrated_number: process.env.WHATSAPP_NUMBER,
      content_type: 'text',
      payload: {
        messaging_product: 'whatsapp',
        to: fullPhone,
        type: 'text',
        text: {
          body: message
        }
      }
    };

    const response = await axios.post(url, payload, {
      headers: {
        'authkey': apiKey,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ WhatsApp message sent to:', phone);
    return { success: true, message: 'WhatsApp message sent successfully' };
  } catch (error) {
    console.error('❌ WhatsApp message failed:', error.response?.data || error.message);
    return { success: false, message: error.message };
  }
};

// Send Order Confirmation via WhatsApp
const sendOrderConfirmationWhatsApp = async (orderData) => {
  const { userName, userPhone, orderId, total, items } = orderData;

  const itemsList = items.map(item => `${item.name} x${item.quantity}`).join(', ');

  const message = `🥛 *Milko Bar Dairy*

Hi ${userName}! 👋

Your order has been confirmed! ✅

*Order Details:*
📦 Order ID: #${orderId}
💰 Total: ₹${total}
🛒 Items: ${itemsList}

We'll deliver your fresh dairy products soon!

Thank you for choosing us! 🙏`;

  return await sendWhatsAppMessage(userPhone, message);
};

// Send Order Status Update via WhatsApp
const sendOrderStatusWhatsApp = async (orderData) => {
  const { userName, userPhone, orderId, status } = orderData;

  let message = '';

  switch(status) {
    case 'In Transit':
      message = `🥛 *Milko Bar Dairy*

Hi ${userName}! 👋

Your order #${orderId} is on the way! 🚚

Our delivery partner will reach you soon.`;
      break;
      
    case 'Delivered':
      message = `🥛 *Milko Bar Dairy*

Hi ${userName}! 👋

Your order #${orderId} has been delivered! 🎉

Thank you for choosing us!`;
      break;
      
    case 'Cancelled':
      message = `🥛 *Milko Bar Dairy*

Hi ${userName}! 👋

Your order #${orderId} has been cancelled. ❌

Contact us: 📞 +91 9358634955`;
      break;
      
    default:
      message = `🥛 *Milko Bar Dairy*

Hi ${userName}! 👋

Order #${orderId} status: *${status}*`;
  }

  return await sendWhatsAppMessage(userPhone, message);
};

// Test WhatsApp configuration
const testWhatsAppConnection = () => {
  const apiKey = process.env.WHATSAPP_API_KEY;
  const whatsappNumber = process.env.WHATSAPP_NUMBER;
  
  if (!apiKey || !whatsappNumber) {
    console.log('⚠️  WhatsApp Service: Not configured (API key or number missing)');
    return false;
  }
  
  console.log('✅ WhatsApp Service: Configured');
  return true;
};

module.exports = {
  sendOrderConfirmationWhatsApp,
  sendOrderStatusWhatsApp,
  testWhatsAppConnection
};
```

