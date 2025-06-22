const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Function to check and create admin user (for auto-seeding on startup)
const createAdminSeeder = async () => {
  try {
    // Check if any admin user exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists in the system');
      return;
    }

    console.log('🔄 No admin user found. Creating default admin user...');

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'Admin123!',
      role: 'admin',
      phone: '+1234567890',
      address: {
        street: '123 Admin Street',
        city: 'Admin City',
        state: 'Admin State',
        zipCode: '12345',
        country: 'USA'
      }
    });

    console.log('✅ Default admin user created successfully:');
    console.log('📧 Email: admin@example.com');
    console.log('🔑 Password: Admin123!');
    console.log('👑 Role: admin');
    console.log('⚠️  Please change the default password after first login!');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  }
};

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'Admin123!',
      role: 'admin',
      phone: '+1234567890',
      address: {
        street: '123 Admin Street',
        city: 'Admin City',
        state: 'Admin State',
        zipCode: '12345',
        country: 'USA'
      }
    });

    console.log('Admin user created successfully:');
    console.log('Email: admin@example.com');
    console.log('Password: Admin123!');
    console.log('Role: admin');

    // Create a regular user for testing
    const existingUser = await User.findOne({ email: 'user@example.com' });
    if (!existingUser) {
      await User.create({
        name: 'Test User',
        email: 'user@example.com',
        password: 'User123!',
        role: 'user',
        phone: '+1234567891',
        address: {
          street: '456 User Street',
          city: 'User City',
          state: 'User State',
          zipCode: '54321',
          country: 'USA'
        }
      });

      console.log('Test user created successfully:');
      console.log('Email: user@example.com');
      console.log('Password: User123!');
      console.log('Role: user');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

// Export the seeder function for use in app startup
module.exports = { createAdminSeeder };

// Run the script if called directly
if (require.main === module) {
  createAdminUser();
}
