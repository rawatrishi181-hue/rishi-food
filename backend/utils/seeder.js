const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Food = require('../models/Food');
const Category = require('../models/Category');

dotenv.config({ path: './.env' });

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB...');

        await Food.deleteMany();
        await Restaurant.deleteMany();
        await Category.deleteMany();
        
        // 1. Setup Categories
        const categoryData = [
            { name: 'Pizza', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300' },
            { name: 'Burgers', image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=300' },
            { name: 'Biryani', image: 'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?w=300' },
            { name: 'Chinese', image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=300' },
            { name: 'Desserts', image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=300' },
            { name: 'Sushi', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=300' },
            { name: 'Healthy', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300' },
            { name: 'South Indian', image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300' },
            { name: 'North Indian', image: 'https://images.unsplash.com/photo-1585937421612-70a0f2455f75?w=300' },
            { name: 'Beverages', image: 'https://images.unsplash.com/photo-1544145945-f904253d0c7b?w=300' }
        ];
        await Category.insertMany(categoryData);

        let owner = await User.findOne({ role: 'restaurant' });
        if(!owner) {
            owner = await User.create({
                name: 'Restaurant Owner',
                email: 'owner@gmail.com',
                password: 'password123',
                role: 'restaurant',
                phone: '9999999999',
                address: 'Market Area'
            });
        }

        // 2. Generate 50 Restaurants
        const cities = ['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad'];
        const cuisineTypes = [
            ['Pizza', 'Italian'], ['Burgers', 'American'], ['Biryani', 'Mughlai'], 
            ['Chinese', 'Asian'], ['Sushi', 'Japanese'], ['Healthy', 'Salads'],
            ['South Indian', 'Kerala'], ['North Indian', 'Punjabi'], ['Desserts', 'Bakery']
        ];
        const restaurantNames = [
            'Bistro', 'Kitchen', 'Diner', 'Cafe', 'Eatery', 'Lounge', 'House', 'Palace', 'Point', 'Hub',
            'Spoon', 'Fork', 'Bowl', 'Plate', 'Oven', 'Grill', 'Spice', 'Leaf', 'Table', 'Bites'
        ];
        const adjectives = ['Royal', 'Green', 'Spicy', 'Urban', 'Classic', 'Grand', 'Little', 'Red', 'Blue', 'Golden'];

        const restaurants = [];
        for (let i = 0; i < 50; i++) {
            const cuisine = cuisineTypes[i % cuisineTypes.length];
            const city = cities[i % cities.length];
            const name = `${adjectives[i % adjectives.length]} ${cuisine[0]} ${restaurantNames[i % restaurantNames.length]}`;
            
            // Assign specific images based on main cuisine
            let img = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4';
            if(cuisine[0] === 'Pizza') img = 'https://images.unsplash.com/photo-1513104890138-7c749659a591';
            else if(cuisine[0] === 'Burgers') img = 'https://images.unsplash.com/photo-1571091718767-18b5b1457add';
            else if(cuisine[0] === 'Biryani') img = 'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8';
            else if(cuisine[0] === 'Chinese') img = 'https://images.unsplash.com/photo-1526318896980-cf78c088247c';
            else if(cuisine[0] === 'Sushi') img = 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c';
            else if(cuisine[0] === 'Healthy') img = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd';
            else if(cuisine[0] === 'Desserts') img = 'https://images.unsplash.com/photo-1551024506-0bccd828d307';
            else if(cuisine[0] === 'South Indian') img = 'https://images.unsplash.com/photo-1589302168068-964664d93dc0';
            else if(cuisine[0] === 'North Indian') img = 'https://images.unsplash.com/photo-1585937421612-70a0f2455f75';

            restaurants.push({
                name: `${name} ${i+1}`, // Ensure uniqueness
                description: `Best ${cuisine[0]} in ${city}. Experience authentic flavors.`,
                address: `${Math.floor(Math.random() * 500) + 1}, Main Road, ${city}`,
                city: city,
                cuisine: cuisine,
                deliveryTime: Math.floor(Math.random() * 30) + 20, // 20-50 mins
                rating: (3.8 + Math.random() * 1.2).toFixed(1), // 3.8 - 5.0
                image: `${img}?auto=format&fit=crop&w=800&q=80`,
                ownerId: owner._id
            });
        }
        
        const insertedRestaurants = await Restaurant.insertMany(restaurants);
        console.log(`Created ${insertedRestaurants.length} Restaurants...`);

        // 3. Generate 10-15 Foods for EACH Restaurant
        const foodTemplates = {
            'Pizza': [
                { n: 'Margherita', p: 299, img: 'https://images.unsplash.com/photo-1574071318508-1cdbad80ad38' },
                { n: 'Pepperoni', p: 449, img: 'https://images.unsplash.com/photo-1628840042765-356cda07504e' },
                { n: 'BBQ Chicken', p: 499, img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38' },
                { n: 'Veggie Supreme', p: 399, img: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47' },
                { n: 'Paneer Tikka Pizza', p: 399, img: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e' }
            ],
            'Burgers': [
                { n: 'Classic Beef', p: 249, img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd' },
                { n: 'Zesty Chicken', p: 279, img: 'https://images.unsplash.com/photo-1550547660-d9450f859349' },
                { n: 'Crispy Veg', p: 199, img: 'https://images.unsplash.com/photo-1520072959219-c595dc870360' },
                { n: 'Bacon Cheese', p: 349, img: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b' }
            ],
            'Biryani': [
                { n: 'Hyderabadi Chicken', p: 349, img: 'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8' },
                { n: 'Lucknowi Mutton', p: 499, img: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0' },
                { n: 'Paneer Tikka Biryani', p: 299, img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7' }
            ],
            'Chinese': [
                { n: 'Hakka Noodles', p: 199, img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246' },
                { n: 'Kung Pao Chicken', p: 299, img: 'https://images.unsplash.com/photo-1525755662778-989d0524087e' },
                { n: 'Manchurian Dry', p: 249, img: 'https://images.unsplash.com/photo-1512058560366-cd2427ba5e73' },
                { n: 'Spring Rolls', p: 149, img: 'https://images.unsplash.com/photo-1544025162-d76694265947' }
            ],
            'Sushi': [
                { n: 'California Roll', p: 499, img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c' },
                { n: 'Salmon Nigiri', p: 599, img: 'https://images.unsplash.com/photo-1583623025817-d180a2221d0a' },
                { n: 'Tuna Sashimi', p: 649, img: 'https://images.unsplash.com/photo-1534422298391-e4f8c170db06' }
            ],
            'Healthy': [
                { n: 'Greek Salad', p: 249, img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd' },
                { n: 'Quinoa Bowl', p: 349, img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c' },
                { n: 'Avocado Toast', p: 299, img: 'https://images.unsplash.com/photo-1525351484163-7529414344d8' }
            ],
            'Desserts': [
                { n: 'Choco Lava Cake', p: 149, img: 'https://images.unsplash.com/photo-1563805042-dfc8d012f5b5' },
                { n: 'Cheesecake', p: 249, img: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad' },
                { n: 'Red Velvet Cupcake', p: 129, img: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7' }
            ],
            'South Indian': [
                { n: 'Masala Dosa', p: 149, img: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0' },
                { n: 'Idli Sambar', p: 99, img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc' },
                { n: 'Medu Vada', p: 119, img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950' }
            ],
            'North Indian': [
                { n: 'Butter Chicken', p: 349, img: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398' },
                { n: 'Dal Makhani', p: 249, img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d' },
                { n: 'Garlic Naan', p: 60, img: 'https://images.unsplash.com/photo-1601289640159-410e84bc5a91' }
            ]
        };

        const sidesAndDrinks = [
            { n: 'French Fries', p: 129, c: 'Sides', img: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877' },
            { n: 'Garlic Bread', p: 149, c: 'Sides', img: 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c' },
            { n: 'Cold Coffee', p: 159, c: 'Beverages', img: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735' },
            { n: 'Mango Lassi', p: 99, c: 'Beverages', img: 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38' },
            { n: 'Coke Zero', p: 60, c: 'Beverages', img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97' },
            { n: 'Brownie', p: 149, c: 'Desserts', img: 'https://images.unsplash.com/photo-1563805042-dfc8d012f5b5' }
        ];

        const foods = [];
        
        for (const rest of insertedRestaurants) {
            const mainCuisine = rest.cuisine[0];
            const templates = foodTemplates[mainCuisine] || foodTemplates['Pizza']; // Fallback
            
            // Add 4-6 Main Course items
            const mainItemsCount = Math.floor(Math.random() * 3) + 4; 
            for(let i=0; i<mainItemsCount; i++) {
                const item = templates[i % templates.length];
                foods.push({
                    name: `${item.n} (Chef's Special)`,
                    description: `Signature ${item.n} prepared with premium ingredients.`,
                    price: item.p + Math.floor(Math.random() * 50),
                    image: `${item.img}?auto=format&fit=crop&w=500&q=80`,
                    category: mainCuisine,
                    restaurantId: rest._id,
                    rating: (4 + Math.random() * 0.9).toFixed(1),
                    isAvailable: true
                });
            }

            // Add 4-6 Sides/Drinks
            const sidesCount = Math.floor(Math.random() * 3) + 4;
            for(let i=0; i<sidesCount; i++) {
                const side = sidesAndDrinks[i % sidesAndDrinks.length];
                foods.push({
                    name: side.n,
                    description: `Perfect pairing for your meal.`,
                    price: side.p,
                    image: `${side.img}?auto=format&fit=crop&w=500&q=80`,
                    category: side.c,
                    restaurantId: rest._id,
                    rating: (4 + Math.random() * 0.9).toFixed(1),
                    isAvailable: true
                });
            }
        }

        const insertedFoods = await Food.insertMany(foods);
        console.log(`Created ${insertedFoods.length} Food items (Avg ~10 per restaurant)...`);

        console.log('Seeding Done Successfully!');
        process.exit();
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seedData();
