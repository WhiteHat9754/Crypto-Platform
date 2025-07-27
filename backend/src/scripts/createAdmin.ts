import mongoose from 'mongoose';
import Admin from '../models/Admin';
import dotenv from 'dotenv';

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('📦 Connected to MongoDB');

    const adminData = {
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@cryptoplatform.com',
      password: 'SuperSecurePassword123!',
      role: 'super_admin' as const,
      permissions: ['view_users', 'manage_users', 'view_withdrawals', 'process_withdrawals', 'view_deposits', 'manage_system'],
      isActive: true
    };

    const existingAdmin = await Admin.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('❌ Admin already exists');
      process.exit(1);
    }

    const admin = await Admin.create(adminData);
    console.log('✅ Admin created successfully:', admin.email);
    console.log('📋 Login credentials:');
    console.log('   Email:', adminData.email);
    console.log('   Password:', adminData.password);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
