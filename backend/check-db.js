const mongoose = require('mongoose');
const Restaurant = require('./src/models/Restaurant');
const Category = require('./src/models/Category');
const Food = require('./src/models/Food');
require('dotenv').config();

async function checkData() {
    await mongoose.connect(process.env.MONGO_URI);
    const restaurants = await Restaurant.countDocuments();
    const categories = await Category.countDocuments();
    const foods = await Food.countDocuments();
    console.log(`Restaurants: ${restaurants}`);
    console.log(`Categories: ${categories}`);
    console.log(`Foods: ${foods}`);
    process.exit();
}

checkData();
