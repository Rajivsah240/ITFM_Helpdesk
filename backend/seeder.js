const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI);

// Admin user
const adminUser = {
  employeeId: '100001',
  name: 'System Administrator',
  email: 'admin@itfm.local',
  password: 'admin123',
  role: 'admin',
  department: 'IIS Department',
  designation: 'ITFM Incharge',
  engineerType: 'ITFM Engineer',
  location: 'Numaligarh',
  phone: '9876543210'
};

// Regular Users (Employee codes starting with 100)
const users = [
  {
    employeeId: '100002',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@nrl.co.in',
    password: 'user123',
    role: 'user',
    department: 'Finance Department',
    designation: 'Senior Accountant',
    phone: '9876543201'
  },
  {
    employeeId: '100003',
    name: 'Priya Sharma',
    email: 'priya.sharma@nrl.co.in',
    password: 'user123',
    role: 'user',
    department: 'HR Department',
    designation: 'HR Executive',
    phone: '9876543202'
  },
  {
    employeeId: '100004',
    name: 'Amit Das',
    email: 'amit.das@nrl.co.in',
    password: 'user123',
    role: 'user',
    department: 'Operations',
    designation: 'Operations Manager',
    phone: '9876543203'
  },
  {
    employeeId: '100005',
    name: 'Sunita Devi',
    email: 'sunita.devi@nrl.co.in',
    password: 'user123',
    role: 'user',
    department: 'Marketing',
    designation: 'Marketing Executive',
    phone: '9876543204'
  },
  {
    employeeId: '100006',
    name: 'Vikram Singh',
    email: 'vikram.singh@nrl.co.in',
    password: 'user123',
    role: 'user',
    department: 'Procurement',
    designation: 'Purchase Officer',
    phone: '9876543205'
  },
  {
    employeeId: '100007',
    name: 'Anita Borah',
    email: 'anita.borah@nrl.co.in',
    password: 'user123',
    role: 'user',
    department: 'Safety Department',
    designation: 'Safety Officer',
    phone: '9876543206'
  },
  {
    employeeId: '100008',
    name: 'Deepak Gogoi',
    email: 'deepak.gogoi@nrl.co.in',
    password: 'user123',
    role: 'user',
    department: 'Technical Services',
    designation: 'Technical Assistant',
    phone: '9876543207'
  },
  {
    employeeId: '100009',
    name: 'Meena Kalita',
    email: 'meena.kalita@nrl.co.in',
    password: 'user123',
    role: 'user',
    department: 'Administration',
    designation: 'Admin Officer',
    phone: '9876543208'
  },
  {
    employeeId: '100010',
    name: 'Ranjan Hazarika',
    email: 'ranjan.hazarika@nrl.co.in',
    password: 'user123',
    role: 'user',
    department: 'Quality Control',
    designation: 'QC Analyst',
    phone: '9876543209'
  },
  {
    employeeId: '100011',
    name: 'Kavita Choudhury',
    email: 'kavita.choudhury@nrl.co.in',
    password: 'user123',
    role: 'user',
    department: 'Logistics',
    designation: 'Logistics Coordinator',
    phone: '9876543211'
  }
];

// Engineers (Employee codes starting with 150)
const engineers = [
  {
    employeeId: '150001',
    name: 'Sanjay Baruah',
    email: 'sanjay.baruah@nrl.co.in',
    password: 'engineer123',
    role: 'engineer',
    department: 'IIS Department',
    designation: 'Senior Engineer',
    engineerType: 'ITFM Engineer',
    location: 'Numaligarh',
    phone: '9876543301'
  },
  {
    employeeId: '150002',
    name: 'Neha Phukan',
    email: 'neha.phukan@nrl.co.in',
    password: 'engineer123',
    role: 'engineer',
    department: 'IIS Department',
    designation: 'Software Engineer',
    engineerType: 'Software Developer',
    location: 'Numaligarh',
    phone: '9876543302'
  },
  {
    employeeId: '150003',
    name: 'Rohit Saikia',
    email: 'rohit.saikia@nrl.co.in',
    password: 'engineer123',
    role: 'engineer',
    department: 'IIS Department',
    designation: 'Network Engineer',
    engineerType: 'ITFM Engineer',
    location: 'Numaligarh',
    phone: '9876543303'
  },
  {
    employeeId: '150004',
    name: 'Pooja Dutta',
    email: 'pooja.dutta@nrl.co.in',
    password: 'engineer123',
    role: 'engineer',
    department: 'IIS Department',
    designation: 'System Administrator',
    engineerType: 'ITFM Engineer',
    location: 'Numaligarh',
    phone: '9876543304'
  },
  {
    employeeId: '150005',
    name: 'Manish Bora',
    email: 'manish.bora@nrl.co.in',
    password: 'engineer123',
    role: 'engineer',
    department: 'IIS Department',
    designation: 'Database Administrator',
    engineerType: 'Software Developer',
    location: 'Numaligarh',
    phone: '9876543305'
  },
  {
    employeeId: '150006',
    name: 'Ankita Sarma',
    email: 'ankita.sarma@nrl.co.in',
    password: 'engineer123',
    role: 'engineer',
    department: 'IIS Department',
    designation: 'IT Support Engineer',
    engineerType: 'ITFM Engineer',
    location: 'NRL-Siliguri',
    phone: '9876543306'
  },
  {
    employeeId: '150007',
    name: 'Bikash Medhi',
    email: 'bikash.medhi@nrl.co.in',
    password: 'engineer123',
    role: 'engineer',
    department: 'IIS Department',
    designation: 'Infrastructure Engineer',
    engineerType: 'ITFM Engineer',
    location: 'NRL Ghy-Co.',
    phone: '9876543307'
  },
  {
    employeeId: '150008',
    name: 'Ritu Bharali',
    email: 'ritu.bharali@nrl.co.in',
    password: 'engineer123',
    role: 'engineer',
    department: 'IIS Department',
    designation: 'Application Developer',
    engineerType: 'Software Developer',
    location: 'Numaligarh',
    phone: '9876543308'
  },
  {
    employeeId: '150009',
    name: 'Gaurav Nath',
    email: 'gaurav.nath@nrl.co.in',
    password: 'engineer123',
    role: 'engineer',
    department: 'IIS Department',
    designation: 'Technical Support',
    engineerType: 'ITFM Engineer',
    location: 'NRL-Delhi',
    phone: '9876543309'
  },
  {
    employeeId: '150010',
    name: 'Dipika Hazarika',
    email: 'dipika.hazarika@nrl.co.in',
    password: 'engineer123',
    role: 'engineer',
    department: 'IIS Department',
    designation: 'Web Developer',
    engineerType: 'Software Developer',
    location: 'Numaligarh',
    phone: '9876543310'
  }
];

// const seedAdmin = async () => {
//   try {
//     // Check if admin already exists
//     const adminExists = await User.findOne({ role: 'admin' });

//     if (adminExists) {
//       console.log('Admin user already exists:');
//       console.log(`  Email: ${adminExists.email}`);
//       console.log(`  Employee ID: ${adminExists.employeeId}`);
//       process.exit(0);
//     }

//     // Create admin user
//     const admin = await User.create(adminUser);

//     console.log('Admin user created successfully!');
//     console.log('----------------------------');
//     console.log(`Employee ID: ${admin.employeeId}`);
//     console.log(`Name: ${admin.name}`);
//     console.log(`Email: ${admin.email}`);
//     console.log(`Password: admin123`);
//     console.log(`Role: ${admin.role}`);
//     console.log('----------------------------');
//     console.log('Please change the password after first login!');

//     process.exit(0);
//   } catch (err) {
//     console.error('Error seeding admin:', err.message);
//     process.exit(1);
//   }
// };

const seedAll = async () => {
  try {
    // Delete existing users
    // await User.deleteMany();
    // console.log('Cleared existing users...\n');

    // Create admin
    // const admin = await User.create(adminUser);
    // console.log('✓ Admin created: ' + admin.name + ' (' + admin.employeeId + ')');

    // Create regular users
    console.log('\n--- Creating Users (100xxx) ---');
    for (const userData of users) {
      const user = await User.create(userData);
      console.log('✓ User created: ' + user.name + ' (' + user.employeeId + ')');
    }

    // Create engineers
    console.log('\n--- Creating Engineers (150xxx) ---');
    for (const engineerData of engineers) {
      const engineer = await User.create(engineerData);
      console.log('✓ Engineer created: ' + engineer.name + ' (' + engineer.employeeId + ') - ' + engineer.location);
    }

    console.log('\n========================================');
    console.log('Seeding completed successfully!');
    console.log('========================================');
    console.log('\nSummary:');
    console.log('  Admin: 1');
    console.log('  Users: ' + users.length);
    console.log('  Engineers: ' + engineers.length);
    console.log('  Total: ' + (1 + users.length + engineers.length));
    console.log('\n--- Login Credentials ---');
    console.log('Admin:    admin@itfm.local / admin123');
    console.log('Users:    [email] / user123');
    console.log('Engineers: [email] / engineer123');
    console.log('========================================\n');

    process.exit(0);
  } catch (err) {
    console.error('Error seeding data:', err.message);
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
// -d : Delete all data
// -a : Seed all (admin + users + engineers)
// (default): Seed admin only
if (process.argv[2] === '-d') {
  deleteAllData();
} else if (process.argv[2] === '-a') {
  seedAll();
} else {
  seedAdmin();
}
