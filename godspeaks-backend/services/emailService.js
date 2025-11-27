const nodemailer = require('nodemailer');

// --- 1. CREATE NODEMAILER TRANSPORTER ---
const transporter = nodemailer.createTransport({
    service: 'Gmail', 
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
    },
});

const sendTestEmail = async (recipientEmail) => {
    const mailOptions = {
        from: `"GodSpeaks" <${process.env.EMAIL_USER}>`, 
        to: recipientEmail, 
        subject: "GodSpeaks - Nodemailer Test", 
        text: "Hello! This is a test email from the GodSpeaks e-commerce backend.", 
        html: "<b>Hello!</b><p>This is a test email from the GodSpeaks e-commerce backend.</p>", 
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log(`Test email sent successfully to ${recipientEmail}. Message ID: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error(`Error sending test email: ${error.message}`);
        return false;
    }
};

/**
 * Sends an order confirmation email to the customer.
 * @param {object} order - The complete order object
 */
const sendOrderConfirmation = async (order) => {
    // --- 1. PREPARE DATA ---
    const customerEmail = order.shippingInfo.email;
    const customerName = order.shippingInfo.name;
    const orderId = order._id.toString().slice(-6).toUpperCase(); 
    const totalPriceInRupees = (order.totalPrice / 100).toFixed(2); 

    // --- 2. CREATE HTML TEMPLATE ---
    const emailHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; color: #333;">
            <div style="background-color: #000; color: #fff; padding: 20px; text-align: center;">
                <h1 style="margin:0;">GodSpeaks</h1>
            </div>
            
            <div style="padding: 20px; border: 1px solid #ddd;">
                <h2 style="color: #0d6efd;">Thank you for your order, ${customerName}!</h2>
                <p>Your order (<b>#${orderId}</b>) has been confirmed and is now processing.</p>
                
                <h3>Order Summary:</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    ${order.orderItems.map(item => `
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 10px;">
                                <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
                            </td>
                            <td style="padding: 10px;">
                                <strong>${item.name}</strong><br/>
                                <span style="font-size: 12px; color: #777;">Size: ${item.size}</span>
                            </td>
                            <td style="padding: 10px; text-align: right;">
                                ${item.qty} x ₹${(item.price / 100).toFixed(2)}
                            </td>
                        </tr>
                    `).join('')}
                </table>
                
                <div style="text-align: right; margin-top: 20px;">
                    <p style="font-size: 18px;"><b>Total: ₹${totalPriceInRupees}</b></p>
                </div>
                
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                
                <p><b>Shipping Address:</b><br/>
                ${order.shippingInfo.address}<br/>
                ${order.shippingInfo.city}, ${order.shippingInfo.state} - ${order.shippingInfo.postalCode}<br/>
                Phone: ${order.shippingInfo.phone}
                </p>

                <p style="margin-top: 30px; font-size: 12px; color: #999; text-align: center;">
                    You can track your order status by logging into your account on our website.<br/>
                    Thank you for supporting GodSpeaks.
                </p>
            </div>
        </div>
    `;

    const mailOptions = {
        from: `"GodSpeaks" <${process.env.EMAIL_USER}>`,
        to: customerEmail,
        subject: `Order Confirmed - Your GodSpeaks Order #${orderId}`,
        html: emailHtml,
    };

    try {
        // --- UNCOMMENT THIS TO ACTUALLY SEND EMAILS ---
        // await transporter.sendMail(mailOptions);
        // console.log(`Order confirmation sent to ${customerEmail}`);
        
        console.log(`--- EMAIL SIMULATION (DB Inactive) ---`);
        console.log(`To: ${customerEmail}`);
        console.log(`Subject: Order Confirmed - Your GodSpeaks Order #${orderId}`);
        console.log(`(Email Content generated with images)`);
        console.log(`----------------------------------------`);
        
    } catch (error) {
        console.error(`Error sending order confirmation email: ${error.message}`);
    }
};

module.exports = {
    sendTestEmail,
    sendOrderConfirmation,
};