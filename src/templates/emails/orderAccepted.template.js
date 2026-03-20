/**
 * Premium Order Accepted Template
 */
const orderAcceptedTemplate = (name, orderId, restaurantName) => {
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
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center; }
            .logo { font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -1px; text-transform: uppercase; font-style: italic; }
            .content { padding: 48px 40px; }
            h1 { font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 16px; }
            .status-card { background-color: #f0fdf4; border-radius: 20px; padding: 32px; border: 1px solid #dcfce7; margin: 32px 0; }
            .status-title { font-size: 18px; font-weight: 800; color: #166534; margin-bottom: 12px; }
            .attributes_item { padding: 8px 0; font-size: 15px; color: #334155; }
            .attributes_label { font-weight: bold; color: #64748b; min-width: 120px; display: inline-block; }
            .cta-container { text-align: center; margin-top: 40px; }
            .button { background-color: #10b981; color: #ffffff !important; padding: 18px 36px; border-radius: 16px; font-weight: 700; text-decoration: none; display: inline-block; }
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
                        <h1>Good News, ${name}! ✅</h1>
                        <p>Your order has been accepted by <strong>${restaurantName}</strong>. They are excited to serve you and will start preparing your meal shortly.</p>
                        
                        <div class="status-card">
                            <div class="status-title">Order Confirmed</div>
                            <div class="attributes_item">
                                <span class="attributes_label">Order ID:</span> #${orderId.toString().slice(-6).toUpperCase()}
                            </div>
                            <div class="attributes_item">
                                <span class="attributes_label">Restaurant:</span> ${restaurantName}
                            </div>
                        </div>

                        <div class="cta-container">
                            <a href="http://localhost:5173/orders" class="button">View Order Status</a>
                        </div>
                        
                        <p style="margin-top: 40px; font-size: 14px; color: #64748b;">
                            Enjoy your day! We'll keep you updated.<br>
                            <strong>The Rishi Food Team</strong>
                        </p>
                    </td>
                </tr>
            </table>
            <div class="footer">
                <p>&copy; 2026 Rishi Food Delivery. All rights reserved.</p>
                <p>Support: rawatrishi181@gmail.com | +91 70672 63151</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = orderAcceptedTemplate;
