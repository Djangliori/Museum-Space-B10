// Test script for UniPay callback handler
// This simulates a callback from UniPay to test our handler

const crypto = require('crypto');

// Load the callback handler
const callbackHandler = require('./api/unipay-callback.js');

// Mock environment variable for testing
process.env.UNIPAY_SECRET = 'test_secret_key_123456789';

// Helper function to create HMAC signature
function createTestSignature(payload, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
}

// Test payload (simulating UniPay callback data)
const testPayload = {
  OrderHashID: 'test_hash_12345',
  MerchantOrderID: 'ORDER_789',
  Status: 'SUCCESS',
  PaymentStatus: 'PAID',
  Amount: '25.00',
  Currency: 'GEL',
  PaymentMethod: 'CARD',
  TransactionID: 'TXN_67890'
};

// Create signature for the test payload
const testSignature = createTestSignature(testPayload, process.env.UNIPAY_SECRET);

// Mock request and response objects
const mockReq = {
  method: 'POST',
  headers: {
    'origin': 'https://betlemi10.com',
    'x-unipay-signature': testSignature,
    'content-type': 'application/json',
    'x-forwarded-for': '127.0.0.1'
  },
  body: testPayload,
  connection: {
    remoteAddress: '127.0.0.1'
  }
};

const mockRes = {
  statusCode: 200,
  headers: {},
  setHeader(name, value) {
    this.headers[name] = value;
    console.log(`📝 Header set: ${name} = ${value}`);
  },
  status(code) {
    this.statusCode = code;
    console.log(`📊 Status set: ${code}`);
    return this;
  },
  json(data) {
    console.log(`📤 Response sent:`, data);
    console.log(`📊 Final status: ${this.statusCode}`);
    return this;
  },
  end() {
    console.log(`✅ Response ended with status: ${this.statusCode}`);
    return this;
  }
};

// Run the test
async function runTest() {
  console.log('🚀 Testing UniPay Callback Handler');
  console.log('================================\n');
  
  console.log('📋 Test payload:', JSON.stringify(testPayload, null, 2));
  console.log('🔐 Test signature:', testSignature);
  console.log('🌐 Test origin:', mockReq.headers.origin);
  console.log('\n🔄 Processing callback...\n');
  
  try {
    await callbackHandler(mockReq, mockRes);
    console.log('\n✅ Test completed successfully!');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Test invalid signature
async function testInvalidSignature() {
  console.log('\n🔒 Testing Invalid Signature');
  console.log('============================\n');
  
  const invalidReq = {
    ...mockReq,
    headers: {
      ...mockReq.headers,
      'x-unipay-signature': 'invalid_signature_123'
    }
  };
  
  const invalidRes = {
    ...mockRes,
    statusCode: 200
  };
  
  try {
    await callbackHandler(invalidReq, invalidRes);
    console.log('\n✅ Invalid signature test completed');
  } catch (error) {
    console.error('\n❌ Invalid signature test failed:', error.message);
  }
}

// Test CORS preflight
async function testCorsPreFlight() {
  console.log('\n🌐 Testing CORS Preflight');
  console.log('========================\n');
  
  const optionsReq = {
    method: 'OPTIONS',
    headers: {
      'origin': 'https://betlemi10.com',
      'access-control-request-method': 'POST'
    }
  };
  
  const optionsRes = {
    ...mockRes,
    statusCode: 200
  };
  
  try {
    await callbackHandler(optionsReq, optionsRes);
    console.log('\n✅ CORS preflight test completed');
  } catch (error) {
    console.error('\n❌ CORS preflight test failed:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  await runTest();
  await testInvalidSignature();
  await testCorsPreFlight();
  
  console.log('\n🎉 All tests completed!');
}

// Execute tests
runAllTests().catch(console.error);