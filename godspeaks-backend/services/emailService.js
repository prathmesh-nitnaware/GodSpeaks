const nodemailer = require('nodemailer');

// --- 1. CREATE NODEMAILER TRANSPORTER ---
const transporter = nodemailer.createTransport({
    service: 'Gmail', 
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
    },
});

// Helper for sending test emails
const sendTestEmail = async (recipientEmail, subject, htmlBody) => {
    const mailOptions = {
        from: `"GodSpeaks" <${process.env.EMAIL_USER}>`, 
        to: recipientEmail, 
        subject: subject || "GodSpeaks Test", 
        html: htmlBody || "<b>Hello!</b><p>Test email.</p>", 
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log(`Test email sent to ${recipientEmail}. ID: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error(`Error sending test email: ${error.message}`);
        return false;
    }
};

/**
 * Sends an order confirmation email to the customer.
 */
const sendOrderConfirmation = async (order) => {
    const customerEmail = order.shippingInfo.email;
    const customerName = order.shippingInfo.name;
    const orderId = order._id.toString().slice(-6).toUpperCase(); 
    const totalPriceInRupees = (order.totalPrice / 100).toFixed(2); 

    const emailHtml = `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto;">
            <h2 style="color: #000;">Hi ${customerName},</h2>
            <p>Thank you for your order <b>#${orderId}</b>.</p>
            <p>We have received your payment and are getting your T-Shirts ready!</p>
            <hr style="border: 0; border-top: 1px solid #eee;"/>
            <h3>Order Details:</h3>
            <ul style="padding-left: 20px;">
            ${order.orderItems.map(item => `
                <li style="margin-bottom: 10px;">
                    <strong>${item.name}</strong> <br/>
                    Size: ${item.size} | Qty: ${item.qty}
                </li>
            `).join('')}
            </ul>
            <p style="font-size: 18px; font-weight: bold;">Total: ₹${totalPriceInRupees}</p>
            <hr style="border: 0; border-top: 1px solid #eee;"/>
            <p>You will receive another email when your order ships.</p>
            <p>Blessings,<br/>The GodSpeaks Team</p>
        </div>
    `;

    const mailOptions = {
        from: `"GodSpeaks" <${process.env.EMAIL_USER}>`,
        to: customerEmail,
        subject: `Order Confirmed - #${orderId}`,
        html: emailHtml,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[Email] Order Confirmation sent to ${customerEmail}`);
    } catch (error) {
        console.error(`[Email] Error sending customer email: ${error.message}`);
    }
};

/**
 * --- NEW: FULFILLMENT EMAIL FOR PRINTER ---
 * Sends High-Res files and details to the printing partner/department.
 */
const sendFulfillmentEmail = async (order) => {
    const orderId = order._id.toString().slice(-6).toUpperCase();
    
    // Check if PRINTER_EMAIL is set, otherwise default to admin email
    const printerEmail = process.env.PRINTER_EMAIL || process.env.EMAIL_USER;

    // Build the table rows for items
    const itemsHtml = order.orderItems.map((item, index) => {
        // Determine the file source: Custom Upload OR Standard Design
        // We look for 'printFileUrl' first (High-Res), then fall back to 'image' (Standard)
        const hasHighRes = item.isCustom && item.printFileUrl;
        
        const printSource = hasHighRes
            ? `<a href="${item.printFileUrl}" style="background: #d9534f; color: white; padding: 5px 10px; text-decoration: none; border-radius: 4px; font-weight: bold;">DOWNLOAD PRINT FILE (300DPI)</a>`
            : `<span style="color: #0275d8;">Standard Stock Design</span>`;

        return `
            <tr style="border-bottom: 1px solid #ccc; background-color: ${index % 2 === 0 ? '#f9f9f9' : '#fff'};">
                <td style="padding: 10px;">
                    <img src="${item.image}" alt="Preview" style="width: 80px; height: 80px; object-fit: cover; border: 1px solid #ddd;">
                </td>
                <td style="padding: 10px;">
                    <strong>${item.name}</strong>
                    <br/><small>ID: ${item.product || 'Custom'}</small>
                </td>
                <td style="padding: 10px; font-size: 16px; text-align: center;">
                    <strong>${item.size}</strong>
                </td>
                <td style="padding: 10px; font-size: 16px; text-align: center;">
                    <strong>${item.qty}</strong>
                </td>
                <td style="padding: 10px; text-align: center;">
                    ${printSource}
                </td>
            </tr>
        `;
    }).join('');

    const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; border: 2px solid #000;">
            <div style="background-color: #000; color: #fff; padding: 15px; text-align: center;">
                <h1 style="margin: 0;">🖨️ NEW PRINT JOB: #${orderId}</h1>
            </div>
            
            <div style="padding: 20px;">
                <p><b>Order Date:</b> ${new Date().toLocaleString()}</p>
                
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <thead>
                        <tr style="background-color: #eee; text-align: left;">
                            <th style="padding: 10px;">Preview</th>
                            <th style="padding: 10px;">Item Name</th>
                            <th style="padding: 10px; text-align: center;">Size</th>
                            <th style="padding: 10px; text-align: center;">Qty</th>
                            <th style="padding: 10px; text-align: center;">Print Source</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>

                <div style="margin-top: 30px; background-color: #ffffcc; padding: 15px; border: 1px solid #e6e600;">
                    <strong>⚠️ Production Note:</strong>
                    <p style="margin: 5px 0 0;">Please verify print file quality before production. Custom files are linked above in Red.</p>
                </div>

                <h3>Shipping Label Info:</h3>
                <pre style="background: #f4f4f4; padding: 15px; font-size: 14px; border-radius: 5px;">${order.shippingInfo.name}
${order.shippingInfo.address}
${order.shippingInfo.city}, ${order.shippingInfo.state} - ${order.shippingInfo.postalCode}
Phone: ${order.shippingInfo.phone}</pre>
            </div>
        </div>
    `;

    const mailOptions = {
        from: `"GodSpeaks Auto" <${process.env.EMAIL_USER}>`,
        to: printerEmail, 
        subject: `[PRINT JOB] Order #${orderId} - ${order.orderItems.length} Items`,
        html: emailHtml,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[Email] Fulfillment Request sent to Printer (${printerEmail})`);
    } catch (error) {
        console.error(`[Email] Error sending printer email: ${error.message}`);
    }
};

module.exports = {
    sendTestEmail,
    sendOrderConfirmation,
    sendFulfillmentEmail,
};