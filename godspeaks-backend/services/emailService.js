const nodemailer = require('nodemailer');

// --- 1. CREATE NODEMAILER TRANSPORTER ---
const transporter = nodemailer.createTransport({
    service: 'Gmail', 
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
    },
});

/**
 * Helper for sending general emails (Used for Test & Abandoned Cart Recovery)
 */
const sendTestEmail = async (recipientEmail, subject, htmlBody) => {
    const mailOptions = {
        from: `"GodSpeaks" <${process.env.EMAIL_USER}>`, 
        to: recipientEmail, 
        subject: subject || "GodSpeaks Update", 
        html: htmlBody, 
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log(`[Email] Message sent to ${recipientEmail}. ID: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error(`[Email Error] ${error.message}`);
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
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
            <h2 style="color: #000; text-align: center;">GodSpeaks.</h2>
            <h3>Hi ${customerName},</h3>
            <p>Your order <b>#GS-${orderId}</b> has been confirmed!</p>
            <p>We've received your payment and our team is currently preparing your apparel.</p>
            <hr style="border: 0; border-top: 1px solid #eee;"/>
            <h4>Order Summary:</h4>
            ${order.orderItems.map(item => `
                <div style="margin-bottom: 15px; display: flex; align-items: center;">
                    <img src="${item.image}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 15px; border-radius: 4px;">
                    <div>
                        <strong>${item.name}</strong><br/>
                        <small>Size: ${item.size} | Qty: ${item.qty} | Color: ${item.color || 'Standard'}</small>
                    </div>
                </div>
            `).join('')}
            <p style="font-size: 18px; font-weight: bold; margin-top: 20px;">Total Paid: ₹${totalPriceInRupees}</p>
            <hr style="border: 0; border-top: 1px solid #eee;"/>
            <p style="font-size: 12px; color: #777;">You will receive another update as soon as your order ships.</p>
            <p>Blessings,<br/>The GodSpeaks Team</p>
        </div>
    `;

    return await sendTestEmail(customerEmail, `Order Confirmed - #GS-${orderId}`, emailHtml);
};

/**
 * --- FULFILLMENT EMAIL FOR PRINTER ---
 * Updated to handle 2 images (Front/Back) and Custom Instructions.
 */
const sendFulfillmentEmail = async (order) => {
    const orderId = order._id.toString().slice(-6).toUpperCase();
    const printerEmail = process.env.PRINTER_EMAIL || process.env.EMAIL_USER;

    const itemsHtml = order.orderItems.map((item, index) => {
        const hasFront = item.isCustom && item.printFileUrl;
        const hasBack = item.isCustom && item.secondaryPrintUrl;
        
        // Artwork Action Buttons
        const frontLink = hasFront 
            ? `<a href="${item.printFileUrl}" style="background: #d9534f; color: white; padding: 6px 12px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block; margin-bottom: 5px;">⬇ FRONT ARTWORK</a>`
            : `<span style="color: #666;">Standard Front</span>`;

        const backLink = hasBack
            ? `<a href="${item.secondaryPrintUrl}" style="background: #0275d8; color: white; padding: 6px 12px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">⬇ BACK ARTWORK</a>`
            : `<span style="color: #999; font-size: 12px;">(No Back Design)</span>`;

        return `
            <tr style="border-bottom: 1px solid #eee; background-color: ${index % 2 === 0 ? '#ffffff' : '#f9f9f9'};">
                <td style="padding: 15px; text-align: center;">
                    <img src="${item.image}" alt="Preview" style="width: 70px; height: 70px; object-fit: cover; border: 1px solid #ddd;">
                </td>
                <td style="padding: 15px;">
                    <div style="font-weight: bold; color: #000;">${item.name}</div>
                    <div style="font-size: 12px; color: #666;">Color: ${item.color || 'Standard'}</div>
                    ${item.message ? `<div style="margin-top: 8px; padding: 5px; background: #fffbcc; border-left: 3px solid #f0ad4e; font-size: 12px;"><strong>Note:</strong> ${item.message}</div>` : ''}
                </td>
                <td style="padding: 15px; text-align: center; font-weight: bold;">${item.size}</td>
                <td style="padding: 15px; text-align: center;">${item.qty}</td>
                <td style="padding: 15px; text-align: right; vertical-align: middle;">
                    ${frontLink} <br/>
                    ${backLink}
                </td>
            </tr>
        `;
    }).join('');

    const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 850px; margin: 0 auto; border: 1px solid #333;">
            <div style="background-color: #000; color: #fff; padding: 20px; text-align: center;">
                <h1 style="margin: 0; letter-spacing: 2px;">🖨️ PRODUCTION ORDER: #GS-${orderId}</h1>
            </div>
            
            <div style="padding: 25px;">
                <p><b>Received:</b> ${new Date().toLocaleString()}</p>
                
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <thead>
                        <tr style="background-color: #f2f2f2; text-align: left; border-bottom: 2px solid #000;">
                            <th style="padding: 10px;">Mockup</th>
                            <th style="padding: 10px;">Product Info</th>
                            <th style="padding: 10px; text-align: center;">Size</th>
                            <th style="padding: 10px; text-align: center;">Qty</th>
                            <th style="padding: 10px; text-align: right;">High-Res Assets</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>

                <div style="margin-top: 30px; border-top: 2px solid #000; padding-top: 20px;">
                    <h3 style="margin-top: 0;">📦 Shipping Destination:</h3>
                    <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; font-family: monospace; font-size: 15px; line-height: 1.5;">
                        <strong>${order.shippingInfo.name}</strong><br/>
                        ${order.shippingInfo.address}<br/>
                        ${order.shippingInfo.city}, ${order.shippingInfo.state} - ${order.shippingInfo.postalCode}<br/>
                        <strong>PH: ${order.shippingInfo.phone}</strong>
                    </div>
                </div>

                <p style="margin-top: 30px; font-size: 12px; color: #888; text-align: center;">
                    This is an automated production request from the GodSpeaks Fulfillment Engine.
                </p>
            </div>
        </div>
    `;

    return await sendTestEmail(printerEmail, `[PRINT JOB] Order #GS-${orderId} - Custom Fulfillment`, emailHtml);
};

module.exports = {
    sendTestEmail,
    sendOrderConfirmation,
    sendFulfillmentEmail,
};