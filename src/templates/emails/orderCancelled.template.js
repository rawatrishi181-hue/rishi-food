/**
 * Premium Order Cancelled Template
 */
const orderCancelledTemplate = (name, orderId, restaurantName, totalAmount) => {
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
            .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 20px; text-align: center; }
            .logo { font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -1px; text-transform: uppercase; font-style: italic; }
            .content { padding: 48px 40px; }
            h1 { font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 16px; }
            .cancel-card { background-color: #fef2f2; border-radius: 20px; padding: 32px; border: 1px solid #fee2e2; margin: 32px 0; }
            .attributes_item { padding: 8px 0; font-size: 15px; color: #334155; }
            .attributes_label { font-weight: bold; color: #64748b; min-width: 120px; display: inline-block; }
            .cta-container { text-align: center; margin-top: 40px; }
            .button { background-color: #1e293b; color: #ffffff !important; padding: 18px 36px; border-radius: 16px; font-weight: 700; text-decoration: none; display: inline-block; }
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
                        <h1>Order Cancelled 🛑</h1>
                        <p>Hello ${name}, your order from <strong>${restaurantName}</strong> has been cancelled. We're sorry for the disappointment.</p>
                        
                        <div class="cancel-card">
                            <div class="attributes_item">
                                <span class="attributes_label">Order ID:</span> #${orderId.toString().slice(-6).toUpperCase()}
                            </div>
                            <div class="attributes_item">
                                <span class="attributes_label">Amount:</span> ₹${totalAmount}
                            </div>
                            <p style="margin-top: 16px; font-weight: 700; color: #b91c1c;">Status: Cancelled & Refund Initiated</p>
                        </div>

                        <p>If you've already paid, your refund will be credited back to your original payment method within 3-5 business days.</p>

                        <div class="cta-container">
                            <a href="http://localhost:5173/" class="button">Browse Other Restaurants</a>
                        </div>
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

module.exports = orderCancelledTemplate;
