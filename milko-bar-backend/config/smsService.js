const axios = require('axios');

// Fast2SMS Configuration
const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY;
const FAST2SMS_URL = 'https://www.fast2sms.com/dev/bulkV2';

// Send Order Confirmation SMS
const sendOrderConfirmationSMS = async (orderData) => {
  const { userPhone, userName, orderId, total } = orderData;

  // Remove +91 or any country code if present
  const phone = userPhone.replace(/[^0-9]/g, '').slice(-10);

  const message = `Hi ${userName}! Your Milko Dairy order #${orderId} of Rs.${total} is confirmed. We'll deliver it soon. Thank you! - Milko Bar Dairy`;

  try {
    const response = await axios.post(FAST2SMS_URL, {
      route: 'v3',
      sender_id: 'MILKOD',
      message: message,
      language: 'english',
      flash: 0,
      numbers: phone
    }, {
      headers: {
        'authorization': FAST2SMS_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.return === true) {
      console.log('✅ Order confirmation SMS sent to:', phone);
      return { success: true, message: 'SMS sent successfully' };
    } else {
      console.error('❌ SMS sending failed:', response.data);
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error('❌ SMS API Error:', error.message);
    return { success: false, message: error.message };
  }
};

// Send Order Status Update SMS
const sendOrderStatusUpdateSMS = async (orderData) => {
  const { userPhone, userName, orderId, status } = orderData;

  const phone = userPhone.replace(/[^0-9]/g, '').slice(-10);

  let message = '';
  
  switch(status) {
    case 'Confirmed':
      message = `Hi ${userName}! Your order #${orderId} is confirmed. Preparing your fresh dairy products!`;
      break;
    case 'Processing':
      message = `Hi ${userName}! Your order #${orderId} is being processed. Will be dispatched soon!`;
      break;
    case 'In Transit':
      message = `Hi ${userName}! Your order #${orderId} is on the way! 🚚 Arriving soon.`;
      break;
    case 'Delivered':
      message = `Hi ${userName}! Your order #${orderId} has been delivered! 🎉 Thank you for choosing Milko Bar Dairy!`;
      break;
    case 'Cancelled':
      message = `Hi ${userName}! Your order #${orderId} has been cancelled. Contact us for any queries.`;
      break;
    default:
      message = `Hi ${userName}! Your order #${orderId} status updated to: ${status}`;
  }

  message += ' - Milko Bar Dairy';

  try {
    const response = await axios.post(FAST2SMS_URL, {
      route: 'v3',
      sender_id: 'MILKOD',
      message: message,
      language: 'english',
      flash: 0,
      numbers: phone
    }, {
      headers: {
        'authorization': FAST2SMS_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.return === true) {
      console.log('✅ Status update SMS sent to:', phone);
      return { success: true, message: 'SMS sent successfully' };
    } else {
      console.error('❌ SMS sending failed:', response.data);
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error('❌ SMS API Error:', error.message);
    return { success: false, message: error.message };
  }
};

// Send OTP for verification
const sendOTP = async (phone, otp) => {
  const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);

  const message = `Your Milko Bar Dairy verification OTP is: ${otp}. Valid for 10 minutes. Do not share with anyone.`;

  try {
    const response = await axios.post(FAST2SMS_URL, {
      route: 'v3',
      sender_id: 'MILKOD',
      message: message,
      language: 'english',
      flash: 0,
      numbers: cleanPhone
    }, {
      headers: {
        'authorization': FAST2SMS_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.return === true) {
      console.log('✅ OTP SMS sent to:', cleanPhone);
      return { success: true, message: 'OTP sent successfully' };
    } else {
      console.error('❌ OTP SMS failed:', response.data);
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error('❌ SMS API Error:', error.message);
    return { success: false, message: error.message };
  }
};

// Test SMS configuration
const testSMSConnection = () => {
  if (!FAST2SMS_API_KEY) {
    console.log('⚠️  SMS Service: Not configured (API key missing)');
    return false;
  }
  console.log('✅ SMS Service: Ready (Fast2SMS)');
  return true;
};

module.exports = {
  sendOrderConfirmationSMS,
  sendOrderStatusUpdateSMS,
  sendOTP,
  testSMSConnection
};