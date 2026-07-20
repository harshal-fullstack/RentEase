const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');
const Business = require('./models/Business');
const ServiceArea = require('./models/ServiceArea');

// Load environment variables
dotenv.config();

// Initialize express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/rentals', require('./routes/rentals'));
app.use('/api/admin', require('./routes/admin'));

app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to RentEase API' });
});

// Seed function for default users and products
const seedDatabase = async () => {
  try {
    // Check if products exist
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('Seeding products...');
      const products = [
        {
          name: 'Classic Queen Size Bed',
          description: 'A comfortable queen size bed with a premium orthopedic mattress and solid wood frame. Perfect for a restful night\'s sleep.',
          category: 'Furniture',
          subCategory: 'Bed',
          imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&auto=format&fit=crop&q=60',
          pricing: { 1: 1200, 3: 1000, 6: 850, 12: 700 },
          deposit: 3000,
          inventory: 10,
          city: 'All'
        },
        {
          name: 'Modern 3-Seater Fabric Sofa',
          description: 'Contemporary design fabric sofa with high-density foam cushions and sturdy wooden legs. Brings elegance to your living room.',
          category: 'Furniture',
          subCategory: 'Sofa',
          imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=60',
          pricing: { 1: 1500, 3: 1300, 6: 1100, 12: 900 },
          deposit: 4000,
          inventory: 8,
          city: 'All'
        },
        {
          name: 'Ergonomic Study Table & Combo',
          description: 'Spacious study/office desk with integrated storage shelves and a height-adjustable mesh chair. Ideal for working from home.',
          category: 'Furniture',
          subCategory: 'Table',
          imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&auto=format&fit=crop&q=60',
          pricing: { 1: 800, 3: 650, 6: 550, 12: 450 },
          deposit: 2000,
          inventory: 15,
          city: 'All'
        },
        {
          name: 'Double Door Refrigerator (260L)',
          description: 'Frost-free double door smart refrigerator with digital inverter compressor and convertible freezer modes. Energy-efficient operations.',
          category: 'Appliances',
          subCategory: 'Fridge',
          imageUrl: 'https://images.unsplash.com/photo-1571175480798-250777587f54?w=600&auto=format&fit=crop&q=60',
          pricing: { 1: 1800, 3: 1600, 6: 1400, 12: 1200 },
          deposit: 5000,
          inventory: 6,
          city: 'All'
        },
        {
          name: '4K Ultra HD Smart TV (43")',
          description: 'Vibrant 4K smart TV with built-in voice assistants, Dolby audio, and streaming service support. Offers an immersive theater experience.',
          category: 'Appliances',
          subCategory: 'TV',
          imageUrl: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600&auto=format&fit=crop&q=60',
          pricing: { 1: 1400, 3: 1200, 6: 1000, 12: 800 },
          deposit: 3500,
          inventory: 12,
          city: 'All'
        },
        {
          name: 'Fully Automatic Washing Machine (6.5kg)',
          description: 'Top-load fully automatic washing machine with smart inverter wash drum and active steam clean functionality. Easy laundry days.',
          category: 'Appliances',
          subCategory: 'Washer',
          imageUrl: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=600&auto=format&fit=crop&q=60',
          pricing: { 1: 1600, 3: 1400, 6: 1200, 12: 1000 },
          deposit: 4500,
          inventory: 7,
          city: 'All'
        }
      ];
      await Product.insertMany(products);
      console.log('Sample products seeded successfully!');
    }

    // Check if users exist
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Seeding default users...');
      
      // Standard customer user
      const defaultUser = new User({
        name: 'John Doe',
        email: 'user@rentease.com',
        password: 'user123',
        role: 'user',
      });
      await defaultUser.save();

      // Administrator user
      const defaultAdmin = new User({
        name: 'Admin Manager',
        email: 'admin@rentease.com',
        password: 'admin123',
        role: 'admin',
      });
      await defaultAdmin.save();

      console.log('Default users seeded successfully! (user@rentease.com / admin@rentease.com)');
    }

    // Check if Service Areas exist
    const serviceAreaCount = await ServiceArea.countDocuments();
    if (serviceAreaCount === 0) {
      console.log('Seeding service areas...');
      const serviceAreas = [
        { cityName: 'All', isActive: true },
        { cityName: 'Bangalore', isActive: true },
        { cityName: 'Mumbai', isActive: true },
        { cityName: 'Delhi', isActive: true },
        { cityName: 'Pune', isActive: true },
        { cityName: 'Hyderabad', isActive: true },
      ];
      await ServiceArea.insertMany(serviceAreas);
      console.log('Service areas seeded successfully!');
    }

    // Check if Businesses exist
    const businessCount = await Business.countDocuments();
    if (businessCount === 0) {
      console.log('Seeding business partners...');
      const allProducts = await Product.find();
      const productIds = allProducts.map((p) => p._id);

      const businesses = [
        {
          name: 'Swift Logistics Partner',
          skillType: 'Delivery',
          servicesOffered: ['Product Delivery', 'Furniture Assembly', 'Appliance Setup'],
          products: productIds,
          pricing: 500,
        },
        {
          name: 'FixIt Squad Repairs',
          skillType: 'Repair',
          servicesOffered: ['General Service', 'Damage Repair', 'Product Replacement'],
          products: productIds,
          pricing: 350,
        },
        {
          name: 'Clean & Shine Maintenance',
          skillType: 'Maintenance',
          servicesOffered: ['Deep Cleaning', 'Sanitization', 'Asset Inspection'],
          products: productIds,
          pricing: 200,
        },
      ];
      await Business.insertMany(businesses);
      console.log('Business partners seeded successfully!');
    }
  } catch (error) {
    console.error(`Database seeding failed: ${error.message}`);
  }
};

// Start Server
const startServer = async () => {
  await connectDB();
  await seedDatabase();

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

startServer();
