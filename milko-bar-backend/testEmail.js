require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('=== Email Configuration Test ===\n');

// Check environment variables
console.log('1. Environment Variables:');
console.log('   EMAIL_USER:', process.env.EMAIL_USER);
console.log('   EMAIL_PASS:', process.env.EMAIL_PASS ? `${process.env.EMAIL_PASS.substring(0, 4)}****` : '❌ Missing');
console.log('   EMAIL_PASS Length:', process.env.EMAIL_PASS?.length, 'characters');
console.log('   EMAIL_PASS Has Spaces:', process.env.EMAIL_PASS?.includes(' ') ? '⚠️ YES (PROBLEM!)' : '✅ NO');
console.log();

// Test different configurations
const configs = [
  {
    name: 'Config 1: service: gmail',
    config: {
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    }
  },
  {
    name: 'Config 2: host & port explicit',
    config: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    }
  },
  {
    name: 'Config 3: port 465 secure',
    config: {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    }
  }
];

async function testConfig(configObj) {
  console.log(`\n2. Testing: ${configObj.name}`);
  const transporter = nodemailer.createTransport(configObj.config);
  
  try {
    await transporter.verify();
    console.log('   ✅ SUCCESS! This configuration works!\n');
    return true;
  } catch (error) {
    console.log('   ❌ FAILED:', error.message);
    return false;
  }
}

async function runTests() {
  for (const config of configs) {
    const success = await testConfig(config);
    if (success) {
      console.log('🎉 Found working configuration!');
      console.log('\nUse this configuration in emailService.js:');
      console.log(JSON.stringify(config.config, null, 2));
      break;
    }
  }
}

runTests();