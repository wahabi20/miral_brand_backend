require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  const existing = await Admin.findOne({ username: process.env.ADMIN_USERNAME });
  if (existing) {
    console.log('Admin already exists. Skipping...');
    process.exit(0);
  }
  const admin = new Admin({
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'Admin@1234'
  });
  await admin.save();
  console.log(`✅ Admin created: ${admin.username}`);
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
