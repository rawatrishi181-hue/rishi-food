/**
 * Premium Order Placed Template
 */
const orderPlacedTemplate = (name, orderId, restaurantName, totalAmount) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
            body { margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Inter', sans-serif; color: #1e293b; }
            .wrapper { width: 100%; table-layout: fixed; background-color: #f8fafc; padding-bottom: 40px; }
            .main { background-color: #ffffff; margin: 40px auto; width: 100%; max-width: 600px; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); }
            .header { background: linear-gradient(135deg, #FF3008 0%, #FF6B00 100%); padding: 40px 20px; text-align: center; }
            .logo { font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -1px; text-transform: uppercase; font-style: italic; }
            .content { padding: 48px 40px; }
            h1 { font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 16px; }
            .order-card { background-color: #f8fafc; border-radius: 20px; padding: 32px; border: 1px solid #e2e8f0; margin: 32px 0; }
            .order-id { font-size: 14px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
            .restaurant-name { font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 24px; }
            .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px dashed #e2e8f0; }
            .detail-label { color: #64748b; font-weight: 500; }
            .detail-value { color: #0f172a; font-weight: 700; }
            .total-row { display: flex; justify-content: space-between; padding-top: 24px; margin-top: 12px; }
            .total-label { font-size: 18px; font-weight: 800; color: #0f172a; }
            .total-value { font-size: 22px; font-weight: 800; color: #FF3008; }
            .status-badge { display: inline-block; padding: 8px 20px; background-color: #eff6ff; color: #2563eb; border-radius: 99px; font-weight: 700; font-size: 12px; text-transform: uppercase; margin-top: 24px; }
            .cta-container { text-align: center; margin-top: 40px; }
            .button { background-color: #0f172a; color: #ffffff !important; padding: 18px 36px; border-radius: 16px; font-weight: 700; text-decoration: none; display: inline-block; }
            .footer { text-align: center; padding: 20px; color: #94a3b8; font-size: 13px; }
        </style>
    </head>
    <body>
        <div class="wrapper">
            <table class="main">
                <tr>
                    <td class="header"><div class="logo">Rishi Food</div></td>
                </tr>
                <tr>
                    <td class="content">
                        <h1>Order Received! 🍕</h1>
                        <p>Hi ${name}, we've got your order! The restaurant is now confirming your items and will start preparing them shortly.</p>
                        
                        <div class="order-card">
                            <div class="order-id">Order ID: #${orderId.toString().slice(-6).toUpperCase()}</div>
                            <div class="restaurant-name">${restaurantName}</div>
                            
                            <div class="detail-row">
                                <span class="detail-label">Status</span>
                                <span class="detail-value" style="color: #2563eb;">Placed</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Estimated Delivery</span>
                                <span class="detail-value">35-45 mins</span>
                            </div>
                            
                            <div class="total-row">
                                <span class="total-label">Total Amount</span>
                                <span class="total-value">₹${totalAmount}</span>
                            </div>
                        </div>

                        <div class="cta-container">
                            <a href="http://localhost:5173/orders" class="button">Track Real-time Status</a>
                        </div>
                        
                        <p style="margin-top: 40px; font-size: 14px; color: #64748b; text-align: center;">
                            Need to change something? <a href="#" style="color: #FF3008; font-weight: 600;">Contact Support</a>
                        </p>
                    </td>
                </tr>
            </table>
            <div class="footer">
                <p>&copy; 2026 Rishi Food Delivery. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = orderPlacedTemplate;
