const nodemailer = require('nodemailer');

// --- 1. CREATE NODEMAILER TRANSPORTER ---
// This transporter object is what actually sends the email.
// We configure it once here and reuse it.
const transporter = nodemailer.createTransport({
    // --- SERVICE CONFIGURATION ---
    // Use 'Gmail' for easy testing, or use SMTP for services like SendGrid.
    service: 'Gmail', // <-- REPLACE with 'SendGrid', 'Brevo', etc. for production
    auth: {
        // --- YOUR EMAIL CREDENTIALS ---
        // IMPORTANT: These MUST be in your .env file
        user: process.env.EMAIL_USER, // <-- REPLACE IN .ENV (e.g., yourname@gmail.com)
        pass: process.env.EMAIL_PASS, // <-- REPLACE IN .ENV (e.g., your Gmail App Password)
    },
});

/**
 * Sends a test email to verify the transporter configuration.
 */
const sendTestEmail = async (recipientEmail) => {
    const mailOptions = {
        from: `"GodSpeaks" <${process.env.EMAIL_USER}>`, // Sender address
        to: recipientEmail, // List of receivers
        subject: "GodSpeaks - Nodemailer Test", // Subject line
        text: "Hello! This is a test email from the GodSpeaks e-commerce backend.", // Plain text body
        html: "<b>Hello!</b><p>This is a test email from the GodSpeaks e-commerce backend.</p>", // HTML body
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
 * @param {object} order - The complete order object (from Order.js model)
 */
const sendOrderConfirmation = async (order) => {
    // --- 1. PREPARE DATA ---
    const customerEmail = order.shippingInfo.email;
    const customerName = order.shippingInfo.name;
    const orderId = order._id.toString().slice(-6).toUpperCase(); // Short, nice order ID
    const totalPriceInRupees = (order.totalPrice / 100).toFixed(2); // Convert paisa to ₹

    // --- 2. CREATE HTML TEMPLATE ---
    // A simple HTML template for the email body
    const emailHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Thank you for your order, ${customerName}!</h2>
            <p>Your order (<b>#${orderId}</b>) has been confirmed and is now processing.</p>
            
            <h3>Order Summary:</h3>
            <ul>
                ${order.orderItems.map(item => `
                    <li>
                        ${item.name} (Size: ${item.size}) - ${item.qty} x ₹${(item.price / 100).toFixed(2)}
                    </li>
                `).join('')}
            </ul>
            <hr>
            <p><b>Total: ₹${totalPriceInRupees}</b></p>
            
            <p>You can track your order status using your email on our website.</p>
            <p>We appreciate your business!</p>
            <p>- The GodSpeaks Team</p>
        </div>
    `;

    // --- 3. DEFINE MAIL OPTIONS ---
    const mailOptions = {
        from: `"GodSpeaks" <${process.env.EMAIL_USER}>`,
        to: customerEmail,
        subject: `Order Confirmed - Your GodSpeaks Order #${orderId}`,
        html: emailHtml,
    };

    // --- 4. SEND EMAIL ---
    try {
        // NOTE: In a real app, you'd only enable this once the DB is working
        // and you've tested the transporter configuration.
        
        // let info = await transporter.sendMail(mailOptions);
        // console.log(`Order confirmation sent to ${customerEmail}. Message ID: ${info.messageId}`);
        
        console.log(`--- EMAIL SIMULATION (DB Inactive) ---`);
        console.log(`To: ${customerEmail}`);
        console.log(`Subject: Order Confirmed - Your GodSpeaks Order #${orderId}`);
        console.log(`----------------------------------------`);
        
    } catch (error) {
        console.error(`Error sending order confirmation email: ${error.message}`);
        // We don't throw an error here because the payment was successful;
        // failing the email shouldn't fail the order verification.
    }
};

module.exports = {
    sendTestEmail,
    sendOrderConfirmation,
};