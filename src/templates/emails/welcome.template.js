/**
 * Premium Welcome Email Template
 */
const welcomeTemplate = (name) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Rishi Food</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
            body { margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; }
            .wrapper { width: 100%; table-layout: fixed; background-color: #f8fafc; padding-bottom: 40px; }
            .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); margin-top: 40px; }
            .header { background: linear-gradient(135deg, #FF3008 0%, #FF6B00 100%); padding: 40px 20px; text-align: center; }
            .logo { font-size: 32px; font-weight: 800; color: #ffffff; letter-spacing: -1px; text-transform: uppercase; font-style: italic; }
            .content { padding: 48px 40px; text-align: left; }
            h1 { font-size: 28px; font-weight: 800; margin-bottom: 24px; color: #0f172a; letter-spacing: -0.025em; }
            p { font-size: 16px; line-height: 1.7; color: #475569; margin-bottom: 24px; }
            .cta-container { text-align: center; margin: 40px 0; }
            .button { background-color: #FF3008; color: #ffffff !important; padding: 18px 36px; border-radius: 16px; font-weight: 700; text-decoration: none; display: inline-block; box-shadow: 0 10px 15px -3px rgba(255, 48, 8, 0.3); transition: transform 0.2s; }
            .features { background-color: #f1f5f9; border-radius: 20px; padding: 32px; margin-bottom: 32px; }
            .feature-item { margin-bottom: 16px; font-weight: 600; color: #334155; display: flex; align-items: center; }
            .footer { text-align: center; padding: 40px 20px; color: #94a3b8; font-size: 14px; }
            .divider { height: 1px; background-color: #e2e8f0; margin: 40px 0; }
        </style>
    </head>
    <body>
        <div class="wrapper">
            <table class="main">
                <tr>
                    <td class="header">
                        <div class="logo">Rishi Food</div>
                    </td>
                </tr>
                <tr>
                    <td class="content">
                        <h1>Welcome to the Family, ${name}! 👋</h1>
                        <p>We're absolutely thrilled to have you join <strong>Rishi Food</strong>! You've just taken the first step towards discovering the most delicious food in your city, delivered right to your doorstep.</p>
                        
                        <div class="features">
                            <div class="feature-item">🚀 Lightning Fast Delivery</div>
                            <div class="feature-item">🍔 500+ Top-rated Restaurants</div>
                            <div class="feature-item">🎁 Exclusive Daily Offers</div>
                            <div class="feature-item">💬 24/7 Premium Support</div>
                        </div>

                        <p>Whether you're craving a late-night pizza, a healthy salad, or a gourmet burger, we've got you covered. Your journey to great food starts here.</p>

                        <div class="cta-container">
                            <a href="http://localhost:5173/" class="button">Start Your First Order</a>
                        </div>

                        <div class="divider"></div>
                        
                        <p style="font-size: 14px; color: #64748b;">If you have any questions, simply reply to this email or visit our Help Center.</p>
                        <p style="font-weight: 600; color: #0f172a; margin-top: 24px;">Happy Eating!<br>The Rishi Food Team</p>
                    </td>
                </tr>
            </table>
            <div class="footer">
                <p>&copy; 2026 Rishi Food Delivery. All rights reserved.</p>
                <p>123 Foodie Street, Culinary District, India</p>
                <p><a href="#" style="color: #94a3b8; text-decoration: underline;">Unsubscribe</a> | <a href="#" style="color: #94a3b8; text-decoration: underline;">Privacy Policy</a></p>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = welcomeTemplate;
