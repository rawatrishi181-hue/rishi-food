/**
 * Premium Order Out For Delivery Template
 */
const orderOutForDeliveryTemplate = (name, orderId, restaurantName) => {
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
            .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 20px; text-align: center; }
            .logo { font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -1px; text-transform: uppercase; font-style: italic; }
            .content { padding: 48px 40px; }
            h1 { font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 16px; }
            .delivery-card { background-color: #eff6ff; border-radius: 20px; padding: 32px; border: 1px solid #dbeafe; margin: 32px 0; text-align: center; }
            .delivery-icon { font-size: 48px; margin-bottom: 16px; }
            .attributes_item { padding: 8px 0; font-size: 15px; color: #334155; text-align: left; }
            .attributes_label { font-weight: bold; color: #64748b; min-width: 120px; display: inline-block; }
            .cta-container { text-align: center; margin-top: 40px; }
            .button { background-color: #3b82f6; color: #ffffff !important; padding: 18px 36px; border-radius: 16px; font-weight: 700; text-decoration: none; display: inline-block; }
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
                        <h1>It's on the way! 🛵</h1>
                        <p>Exciting news, ${name}! Your order from <strong>${restaurantName}</strong> is out for delivery. Our rider is heading your way with your fresh meal.</p>
                        
                        <div class="delivery-card">
                            <div class="delivery-icon">🚀</div>
                            <div class="attributes_item">
                                <span class="attributes_label">Order ID:</span> #${orderId.toString().slice(-6).toUpperCase()}
                            </div>
                            <p style="margin-top: 16px; font-weight: 700; color: #1e40af;">Rider is arriving in 5-10 mins</p>
                        </div>

                        <div class="cta-container">
                            <a href="http://localhost:5173/orders" class="button">Track Live Location</a>
                        </div>
                        
                        <p style="margin-top: 40px; font-size: 14px; color: #64748b;">
                            Please be ready to receive your order.<br>
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

module.exports = orderOutForDeliveryTemplate;
