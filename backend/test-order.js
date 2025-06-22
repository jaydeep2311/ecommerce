const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Order = require('./models/Order');

async function testOrderCreation() {
  try {
    console.log('Testing order creation...');
    
    // Create a test order
    const testOrder = new Order({
      user: new mongoose.Types.ObjectId(),
      items: [{
        product: new mongoose.Types.ObjectId(),
        name: 'Test Product',
        image: 'https://example.com/image.jpg',
        price: 29.99,
        quantity: 2,
        total: 59.98
      }],
      shippingAddress: {
        fullName: 'Test User',
        street: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        country: 'USA'
      },
      paymentInfo: {
        method: 'cash_on_delivery'
      },
      pricing: {
        subtotal: 59.98,
        tax: 0,
        shipping: 0,
        discount: 0,
        total: 59.98
      }
    });

    await testOrder.save();
    
    console.log('Order created successfully!');
    console.log('Order Number:', testOrder.orderNumber);
    console.log('Order ID:', testOrder._id);
    
    // Clean up - delete the test order
    await Order.findByIdAndDelete(testOrder._id);
    console.log('Test order cleaned up');
    
  } catch (error) {
    console.error('Error creating order:', error.message);
    console.error('Full error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testOrderCreation();
