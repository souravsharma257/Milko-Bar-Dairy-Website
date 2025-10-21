const nodemailer = require('nodemailer');

// Lazy transporter initialization - will create only when needed
let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  return transporter;
};

// Send Order Confirmation Email
const sendOrderConfirmation = async (orderData) => {
  const { userName, email, orderId, items, total, paymentMethod, userAddress, userPhone } = orderData;

  // Create items list HTML
  const itemsHTML = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name} (${item.unit})</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">₹${item.price * item.quantity}</td>
    </tr>
  `).join('');

  const mailOptions = {
    from: `"Milko Bar Dairy" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Order Confirmation - #${orderId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          table { width: 100%; border-collapse: collapse; }
          .total-row { background: #667eea; color: white; font-weight: bold; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🥛 Milko Bar Dairy</h1>
            <p style="margin: 0; font-size: 18px;">Order Confirmed!</p>
          </div>
          
          <div class="content">
            <h2 style="color: #667eea;">Hi ${userName},</h2>
            <p style="font-size: 16px;">Thank you for your order! We're preparing your fresh dairy products.</p>
            
            <div class="order-details">
              <h3 style="color: #667eea; margin-top: 0;">Order Details</h3>
              <p><strong>Order ID:</strong> #${orderId}</p>
              <p><strong>Order Date:</strong> ${new Date().toLocaleDateString('en-IN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
              <p><strong>Payment Method:</strong> ${paymentMethod}</p>
              
              <h4 style="margin-top: 20px;">Delivery Address:</h4>
              <p style="background: #f0f0f0; padding: 10px; border-radius: 5px;">
                ${userAddress}<br>
                Phone: ${userPhone}
              </p>
              
              <h4 style="margin-top: 20px;">Items Ordered:</h4>
              <table style="margin-top: 10px;">
                <thead>
                  <tr style="background: #667eea; color: white;">
                    <th style="padding: 10px; text-align: left;">Product</th>
                    <th style="padding: 10px; text-align: center;">Qty</th>
                    <th style="padding: 10px; text-align: right;">Price</th>
                    <th style="padding: 10px; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                  <tr class="total-row">
                    <td colspan="3" style="padding: 15px; text-align: right;">TOTAL AMOUNT:</td>
                    <td style="padding: 15px; text-align: right; font-size: 20px;">₹${total}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 20px;">
              Your order will be delivered within 2-3 hours. You can track your order status in the "My Orders" section.
            </p>
            
            <div style="text-align: center;">
              <p style="margin-top: 30px; font-size: 16px;">Need help? Contact us:</p>
              <p style="margin: 5px 0;">📞 +91 9358634955</p>
              <p style="margin: 5px 0;">📧 info@milkobardairy.com</p>
              <p style="margin: 5px 0;">📍 Shahjahanpur, Rajasthan</p>
            </div>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Milko Bar Dairy. All rights reserved.</p>
            <p>Fresh Dairy Products Delivered to Your Doorstep</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await getTransporter().sendMail(mailOptions);
    console.log('✅ Order confirmation email sent to:', email);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return { success: false, message: error.message };
  }
};

// Send Order Status Update Email
const sendOrderStatusUpdate = async (orderData) => {
  const { userName, email, orderId, status } = orderData;

  let statusMessage = '';
  let statusColor = '';

  switch(status) {
    case 'In Transit':
      statusMessage = 'Your order is on the way! 🚚';
      statusColor = '#3b82f6';
      break;
    case 'Delivered':
      statusMessage = 'Your order has been delivered! 🎉';
      statusColor = '#10b981';
      break;
    case 'Cancelled':
      statusMessage = 'Your order has been cancelled.';
      statusColor = '#ef4444';
      break;
    default:
      statusMessage = 'Order status updated.';
      statusColor = '#667eea';
  }

  const mailOptions = {
    from: `"Milko Bar Dairy" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Order Update - #${orderId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${statusColor}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .status-box { background: white; padding: 20px; border-left: 4px solid ${statusColor}; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🥛 Milko Bar Dairy</h1>
            <h2 style="margin: 10px 0 0 0;">${statusMessage}</h2>
          </div>
          
          <div class="content">
            <h2>Hi ${userName},</h2>
            <div class="status-box">
              <p><strong>Order ID:</strong> #${orderId}</p>
              <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${status}</span></p>
            </div>
            
            <p>Thank you for choosing Milko Bar Dairy!</p>
            
            <div style="text-align: center; margin-top: 30px;">
              <p>Need help?</p>
              <p>📞 +91 9358634955 | 📧 info@milkobardairy.com</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await getTransporter().sendMail(mailOptions);
    console.log('✅ Status update email sent to:', email);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return { success: false, message: error.message };
  }
};

// Test email configuration
const testEmailConnection = async () => {
  try {
    await getTransporter().verify();
    console.log('✅ Email server is ready');
    return true;
  } catch (error) {
    console.error('❌ Email server error:', error);
    console.error('Credentials check:', {
      user: process.env.EMAIL_USER ? '✅' : '❌',
      pass: process.env.EMAIL_PASS ? '✅' : '❌'
    });
    return false;
  }
};

module.exports = {
  sendOrderConfirmation,
  sendOrderStatusUpdate,
  testEmailConnection
};