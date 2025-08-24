// Test real UniPay order creation to see exact error
const fetch = require('node-fetch');

async function testUniPay() {
  try {
    console.log('1. Authenticating...');
    
    // Step 1: Auth
    const authResponse = await fetch('https://apiv2.unipay.com/v3/auth', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        merchant_id: '5015191030581',
        api_key: 'bc6f5073-6d1c-4abe-8456-1bb814077f6e'
      })
    });

    const authData = await authResponse.json();
    console.log('Auth result:', authData);

    if (!authData.auth_token) {
      throw new Error('No auth token');
    }

    console.log('2. Creating order...');
    
    // Step 2: Create order
    const orderData = {
      MerchantUser: 'test.user@museum-space.ge',
      MerchantOrderID: `TEST-${Date.now()}`,
      OrderPrice: 10.0,
      OrderCurrency: 'GEL',
      OrderName: 'Test Ticket',
      OrderDescription: 'Museum Test Ticket',
      SuccessRedirectUrl: Buffer.from('https://betlemi10.com/payment-success.html').toString('base64'),
      CancelRedirectUrl: Buffer.from('https://betlemi10.com/payment-cancel.html').toString('base64'),
      CallBackUrl: Buffer.from('https://betlemi10.com/api/unipay-callback').toString('base64'),
      Language: 'GE'
    };

    console.log('Order data:', orderData);

    const orderResponse = await fetch('https://apiv2.unipay.com/v3/api/order/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authData.auth_token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    console.log('Order response status:', orderResponse.status);
    console.log('Order response headers:', Object.fromEntries(orderResponse.headers.entries()));

    const orderResult = await orderResponse.text();
    console.log('Order raw response:', orderResult);

    try {
      const parsedResult = JSON.parse(orderResult);
      console.log('Order parsed response:', parsedResult);
      
      if (parsedResult.data && parsedResult.data.Checkout) {
        console.log('✅ SUCCESS! Checkout URL:', parsedResult.data.Checkout);
      }
    } catch (e) {
      console.log('Failed to parse order response as JSON');
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testUniPay();