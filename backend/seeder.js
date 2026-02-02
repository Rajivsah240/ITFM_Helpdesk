const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI);

const seedAdmin = async () => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ role: 'admin' });

    if (adminExists) {
      console.log('Admin user already exists:');
      console.log(`  Email: ${adminExists.email}`);
      console.log(`  Employee ID: ${adminExists.employeeId}`);
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      employeeId: 'EMP001',
      name: 'System Administrator',
      email: 'admin@itfm.local',
      password: 'admin123',
      role: 'admin',
      department: 'IT Department',
      phone: '1234567890'
    });

    console.log('Admin user created successfully!');
    console.log('----------------------------');
    console.log(`Employee ID: ${admin.employeeId}`);
    console.log(`Name: ${admin.name}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Password: admin123`);
    console.log(`Role: ${admin.role}`);
    console.log('----------------------------');
    console.log('Please change the password after first login!');

    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err.message);
    process.exit(1);
  }
};

const deleteAllData = async () => {
  try {
    await User.deleteMany();
    await mongoose.model('Ticket').deleteMany();
    await mongoose.model('Notification').deleteMany();
    
    console.log('All data deleted!');
    process.exit(0);
  } catch (err) {
    console.error('Error deleting data:', err.message);
    process.exit(1);
  }
};

// Run seeder based on command line argument
if (process.argv[2] === '-d') {
  deleteAllData();
} else {
  seedAdmin();
}
