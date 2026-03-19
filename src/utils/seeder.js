const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Food = require('../models/Food');
const Category = require('../models/Category');
const FAQ = require('../models/FAQ');

// Load env vars
dotenv.config({ path: './.env' });

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

const seedData = async () => {
    try {
        // Clear existing data
        await Food.deleteMany();
        await Restaurant.deleteMany();
        await User.deleteMany();
        await Category.deleteMany();
        await FAQ.deleteMany();

        console.log('Data destroyed...');

        // Create Users
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@gmail.com',
            password: 'password123',
            role: 'admin',
            phone: '1234567890',
            address: '123 Admin Lane'
        });

        const owner = await User.create({
            name: 'Restaurant Owner',
            email: 'owner@gmail.com',
            password: 'password123',
            role: 'restaurant',
            phone: '0987654321',
            address: '456 Owner St'
        });

        console.log('Users created...');

        // Create Categories
        const categories = await Category.insertMany([
            { name: 'Pizza', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=300&q=80' },
            { name: 'Burgers', image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=300&q=80' },
            { name: 'Sushi', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=300&q=80' },
            { name: 'Desserts', image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=300&q=80' },
            { name: 'Healthy', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=300&q=80' },
            { name: 'Biryani', image: 'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?auto=format&fit=crop&w=300&q=80' },
            { name: 'Chinese', image: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?auto=format&fit=crop&w=300&q=80' },
            { name: 'South Indian', image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=300&q=80' }
        ]);

        console.log('Categories created...');

        // Create Restaurants
        const restaurantData = [
            {
                name: 'The Pizza Loft',
                description: 'Artisanal sourdough pizzas with fresh Italian toppings.',
                address: '12 Green Valley',
                city: 'Delhi',
                cuisine: ['Pizza', 'Italian'],
                deliveryTime: 25,
                rating: 4.5,
                image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
                ownerId: owner._id
            },
            {
                name: 'Burger Mansion',
                description: 'Gourmet burgers with hand-cut fries and thick shakes.',
                address: '45 Sunset Blvd',
                city: 'Mumbai',
                cuisine: ['Burgers', 'American', 'Fast Food'],
                deliveryTime: 20,
                rating: 4.2,
                image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
                ownerId: owner._id
            },
            {
                name: 'Royal Biryani House',
                description: 'Authentic Hyderabadi and Lucknowi biryani.',
                address: '88 Old Market',
                city: 'Hyderabad',
                cuisine: ['Biryani', 'North Indian'],
                deliveryTime: 35,
                rating: 4.8,
                image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80',
                ownerId: owner._id
            },
            {
                name: 'Wok & Roll',
                description: 'Fast and fresh Chinese street food.',
                address: '22 Dragon Lane',
                city: 'Bangalore',
                cuisine: ['Chinese', 'Asian'],
                deliveryTime: 15,
                rating: 4.0,
                image: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?auto=format&fit=crop&w=800&q=80',
                ownerId: owner._id
            },
            {
                name: 'South Spice',
                description: 'Traditional dosas, idlis, and filter coffee.',
                address: '10 Temple Road',
                city: 'Chennai',
                cuisine: ['South Indian'],
                deliveryTime: 25,
                rating: 4.6,
                image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80',
                ownerId: owner._id
            },
            {
                name: 'Sushi Zen',
                description: 'Premium sushi and sashimi made by expert chefs.',
                address: '55 Tokyo Tower',
                city: 'Pune',
                cuisine: ['Japanese', 'Sushi'],
                deliveryTime: 40,
                rating: 4.7,
                image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80',
                ownerId: owner._id
            },
            {
                name: 'Green Bowl',
                description: 'Fresh salads and healthy organic meals.',
                address: '33 Health Park',
                city: 'Chandigarh',
                cuisine: ['Healthy', 'Salads'],
                deliveryTime: 20,
                rating: 4.3,
                image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
                ownerId: owner._id
            },
            {
                name: 'Sugar Rush',
                description: 'Indulgent desserts, waffles, and ice creams.',
                address: '11 Candy Street',
                city: 'Kolkata',
                cuisine: ['Desserts', 'Bakery'],
                deliveryTime: 30,
                rating: 4.4,
                image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=800&q=80',
                ownerId: owner._id
            }
        ];

        const restaurants = await Restaurant.insertMany(restaurantData);
        console.log('Restaurants created...');

        // Create Food Items (Approx 50 items)
        const foods = [];
        
        // Pizza Loft Items
        const pizzaRest = restaurants[0]._id;
        foods.push(
            { name: 'Margherita Pizza', description: 'Classic cheese and tomato with fresh basil.', price: 299, category: 'Pizza', restaurantId: pizzaRest, image: 'https://images.unsplash.com/photo-1574071318508-1cdbad80ad38?auto=format&fit=crop&w=500&q=80' },
            { name: 'Pepperoni Pizza', description: 'Double pepperoni with extra mozzarella.', price: 449, category: 'Pizza', restaurantId: pizzaRest, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=500&q=80' },
            { name: 'Veggie Paradise', description: 'Capsicum, corn, mushroom, and olives.', price: 399, category: 'Pizza', restaurantId: pizzaRest, image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=500&q=80' },
            { name: 'Garlic Breadsticks', description: 'Freshly baked with garlic butter.', price: 149, category: 'Sides', restaurantId: pizzaRest, image: 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?auto=format&fit=crop&w=500&q=80' },
            { name: 'Paneer Tikka Pizza', description: 'Indian fusion with spicy paneer chunks.', price: 429, category: 'Pizza', restaurantId: pizzaRest, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=80' }
        );

        // Burger Mansion Items
        const burgerRest = restaurants[1]._id;
        foods.push(
            { name: 'Classic Beef Burger', description: 'Flame-grilled beef patty with lettuce and cheese.', price: 249, category: 'Burgers', restaurantId: burgerRest, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80' },
            { name: 'Crispy Chicken Burger', description: 'Golden fried chicken breast with spicy mayo.', price: 199, category: 'Burgers', restaurantId: burgerRest, image: 'https://images.unsplash.com/photo-1513185158878-8d8c196b7f7c?auto=format&fit=crop&w=500&q=80' },
            { name: 'Veggie Burger', description: 'Aloo tikki with fresh veggies and cream sauce.', price: 149, category: 'Burgers', restaurantId: burgerRest, image: 'https://images.unsplash.com/photo-1550317138-10000687ad32?auto=format&fit=crop&w=500&q=80' },
            { name: 'French Fries', description: 'Hand-cut crispy golden fries.', price: 99, category: 'Sides', restaurantId: burgerRest, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=500&q=80' },
            { name: 'Chocolate Milkshake', description: 'Thick and creamy with real cocoa.', price: 179, category: 'Drinks', restaurantId: burgerRest, image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=500&q=80' }
        );

        // Biryani House Items
        const biryaniRest = restaurants[2]._id;
        foods.push(
            { name: 'Chicken Dum Biryani', description: 'Fragrant basmati rice with tender chicken.', price: 329, category: 'Biryani', restaurantId: biryaniRest, image: 'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?auto=format&fit=crop&w=500&q=80' },
            { name: 'Mutton Biryani', description: 'Slow-cooked mutton with secret spices.', price: 449, category: 'Biryani', restaurantId: biryaniRest, image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=500&q=80' },
            { name: 'Paneer Biryani', description: 'Vegetarian delight with soft paneer cubes.', price: 279, category: 'Biryani', restaurantId: biryaniRest, image: 'https://images.unsplash.com/photo-1642821334182-4205216127dc?auto=format&fit=crop&w=500&q=80' },
            { name: 'Chicken Tikka', description: 'Smoky grilled chicken pieces.', price: 299, category: 'Appetizers', restaurantId: biryaniRest, image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=500&q=80' },
            { name: 'Gulab Jamun', description: 'Warm sweet balls in syrup.', price: 79, category: 'Desserts', restaurantId: biryaniRest, image: 'https://images.unsplash.com/photo-1589113103503-494537fe9bb7?auto=format&fit=crop&w=500&q=80' }
        );

        // Wok & Roll Items
        const chineseRest = restaurants[3]._id;
        foods.push(
            { name: 'Hakka Noodles', description: 'Stir-fried noodles with fresh veggies.', price: 189, category: 'Chinese', restaurantId: chineseRest, image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=500&q=80' },
            { name: 'Manchurian', description: 'Veg balls in spicy soya sauce.', price: 199, category: 'Chinese', restaurantId: chineseRest, image: 'https://images.unsplash.com/photo-1623341214825-9f4f963727da?auto=format&fit=crop&w=500&q=80' },
            { name: 'Spring Rolls', description: 'Crispy rolls with veggie filling.', price: 149, category: 'Appetizers', restaurantId: chineseRest, image: 'https://images.unsplash.com/photo-1544333346-64799188e102?auto=format&fit=crop&w=500&q=80' },
            { name: 'Fried Rice', description: 'Classic stir-fried rice with eggs/veggies.', price: 179, category: 'Chinese', restaurantId: chineseRest, image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=500&q=80' },
            { name: 'Dim Sums', description: 'Steamed dumplings with spicy dip.', price: 219, category: 'Appetizers', restaurantId: chineseRest, image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=500&q=80' }
        );

        // South Spice Items
        const southRest = restaurants[4]._id;
        foods.push(
            { name: 'Masala Dosa', description: 'Crispy dosa with potato filling.', price: 129, category: 'South Indian', restaurantId: southRest, image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=500&q=80' },
            { name: 'Idli Sambhar', description: 'Soft steamed rice cakes with lentil soup.', price: 89, category: 'South Indian', restaurantId: southRest, image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=500&q=80' },
            { name: 'Vada', description: 'Savory fried doughnuts.', price: 79, category: 'South Indian', restaurantId: southRest, image: 'https://images.unsplash.com/photo-1601050638917-3d8437df47b3?auto=format&fit=crop&w=500&q=80' },
            { name: 'Filter Coffee', description: 'Traditional South Indian brew.', price: 59, category: 'Drinks', restaurantId: southRest, image: 'https://images.unsplash.com/photo-1594631252845-29fc4586d517?auto=format&fit=crop&w=500&q=80' },
            { name: 'Onion Uthappam', description: 'Thick pancake with onion toppings.', price: 119, category: 'South Indian', restaurantId: southRest, image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=500&q=80' }
        );

        // Add more items to reach 50...
        const commonItems = [
            { name: 'California Roll', price: 599, category: 'Sushi', desc: 'Crab and avocado.' },
            { name: 'Salmon Sashimi', price: 799, category: 'Sushi', desc: 'Fresh slices of salmon.' },
            { name: 'Miso Soup', price: 199, category: 'Japanese', desc: 'Warm soybean soup.' },
            { name: 'Tofu Salad', price: 249, category: 'Healthy', desc: 'Organic tofu with greens.' },
            { name: 'Quinoa Bowl', price: 349, category: 'Healthy', desc: 'Superfood mix with veggies.' },
            { name: 'Avocado Toast', price: 299, category: 'Healthy', desc: 'On whole grain bread.' },
            { name: 'Waffle with Syrup', price: 249, category: 'Desserts', desc: 'Golden waffles.' },
            { name: 'Vanilla Ice Cream', price: 99, category: 'Desserts', desc: 'Two scoops of classic.' },
            { name: 'Fruit Parfait', price: 199, category: 'Desserts', desc: 'Yogurt and fresh fruits.' },
            { name: 'Iced Tea', price: 89, category: 'Drinks', desc: 'Refreshing lemon tea.' },
            { name: 'Fresh Lime Soda', price: 79, category: 'Drinks', desc: 'Sweet or salted.' },
            { name: 'Tandoori Roti', price: 25, category: 'Bread', desc: 'Whole wheat bread.' },
            { name: 'Butter Naan', price: 45, category: 'Bread', desc: 'Soft and buttery.' },
            { name: 'Dal Makhani', price: 249, category: 'Main Course', desc: 'Slow cooked black lentils.' },
            { name: 'Paneer Butter Masala', price: 289, category: 'Main Course', desc: 'Rich tomato gravy.' },
            { name: 'Mix Veg', price: 199, category: 'Main Course', desc: 'Seasonal vegetables.' },
            { name: 'Gulab Jamun (2pcs)', price: 79, category: 'Desserts', desc: 'Warm sweet balls.' },
            { name: 'Rasmalai', price: 99, category: 'Desserts', desc: 'Soft cottage cheese discs.' },
            { name: 'Mango Lassi', price: 129, category: 'Drinks', desc: 'Thick mango yogurt drink.' },
            { name: 'Sweet Corn Soup', price: 129, category: 'Appetizers', desc: 'Warm and comforting.' },
            { name: 'Honey Chilli Potato', price: 199, category: 'Appetizers', desc: 'Sweet and spicy fries.' },
            { name: 'Chicken Wings', price: 299, category: 'Appetizers', desc: 'Spicy BBQ wings.' },
            { name: 'Nachos with Salsa', price: 219, category: 'Appetizers', desc: 'Crunchy corn chips.' },
            { name: 'Garlic Prawns', price: 499, category: 'Appetizers', desc: 'Sautéed in garlic butter.' },
            { name: 'Club Sandwich', price: 189, category: 'Sandwich', desc: 'Multi-layered sandwich.' }
        ];

        commonItems.forEach((item, index) => {
            const restId = restaurants[index % restaurants.length]._id;
            foods.push({
                name: item.name,
                description: item.desc || 'A delicious dish prepared fresh.',
                price: item.price,
                category: item.category,
                restaurantId: restId,
                image: `https://source.unsplash.com/featured/?food,${encodeURIComponent(item.name)}`
            });
        });

        await Food.insertMany(foods);
        console.log(`Successfully seeded ${restaurants.length} restaurants and ${foods.length} food items.`);

        // Seed FAQs
        const faqs = [
            {
                question: 'How do I place an order on RishiFood?',
                answer: 'Simply browse your favorite restaurants, add delicious items to your cart, and proceed to checkout with your preferred payment method. It\'s that easy!',
                category: 'Ordering',
                image: 'https://images.unsplash.com/photo-1526367790999-0150786486a9?auto=format&fit=crop&w=500&q=80'
            },
            {
                question: 'What payment methods do you accept?',
                answer: 'We support all major payment methods including Cash on Delivery (COD), UPI, Credit/Debit cards, and Net Banking for a seamless checkout experience.',
                category: 'Payments',
                image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=500&q=80'
            },
            {
                question: 'How can I join as a Delivery Partner?',
                answer: 'Joining the RishiFood fleet is simple! Visit our Delivery Partner portal, register with your vehicle details and license, and start earning on your own schedule.',
                category: 'Partners',
                image: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=500&q=80'
            },
            {
                question: 'Is my data and privacy secure?',
                answer: 'Your security is our priority. RishiFood uses industry-standard encryption to protect your personal information and payment details at all times.',
                category: 'Security',
                image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=500&q=80'
            }
        ];

        await FAQ.insertMany(faqs);
        console.log('FAQs seeded successfully!');

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedData();
