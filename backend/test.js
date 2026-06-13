const fetch = require('node:http').request; // We can write a simple HTTP request helper to avoid installing external test runners
const { fork } = require('node:child_process');
const http = require('node:http');

const checkServerUp = () => {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:5000/api', (res) => {
      resolve(true);
    });
    req.on('error', () => {
      resolve(false);
    });
    req.end();
  });
};

const request = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = require('node:http').request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            body: data ? JSON.parse(data) : {}
          });
        } catch (e) {
          resolve({ status: res.statusCode, body: { raw: data } });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('=== RentEase Backend API Integration Tests ===\n');
  const baseUrl = 'http://localhost:5000/api';
  let userToken = '';
  let sampleProductId = '';
  let child;

  try {
    const isUp = await checkServerUp();
    if (!isUp) {
      console.log('Server is not running on port 5000. Booting up server...');
      child = fork('./server.js', { silent: true });
      let retries = 25;
      let serverReady = false;
      while (retries > 0) {
        await new Promise((r) => setTimeout(r, 400));
        if (await checkServerUp()) {
          serverReady = true;
          break;
        }
        retries--;
      }
      if (!serverReady) {
        throw new Error('Server failed to start on port 5000 within 10 seconds.');
      }
      console.log('Server started successfully!\n');
    }
    // Test 1: Fetch Catalog Products
    console.log('Test 1: Fetching catalog products...');
    const catRes = await request(`${baseUrl}/products`);
    if (catRes.status === 200 && catRes.body.success && catRes.body.products.length > 0) {
      console.log(`✓ Catalog fetched successfully! Products found: ${catRes.body.products.length}`);
      sampleProductId = catRes.body.products[0]._id;
      console.log(`  Sample Product ID: ${sampleProductId} (${catRes.body.products[0].name})\n`);
    } else {
      throw new Error(`Catalog retrieval failed with status ${catRes.status}`);
    }

    // Test 2: User Register
    console.log('Test 2: Registering a test user...');
    const registerEmail = `test_${Date.now()}@test.com`;
    const regRes = await request(`${baseUrl}/auth/register`, {
      method: 'POST',
      body: {
        name: 'Test QA User',
        email: registerEmail,
        password: 'password123',
        role: 'user'
      }
    });

    if (regRes.status === 201 && regRes.body.success && regRes.body.token) {
      console.log(`✓ Registration succeeded for ${registerEmail}!`);
      userToken = regRes.body.token;
      console.log(`  JWT Token generated successfully.\n`);
    } else {
      throw new Error(`Registration failed: ${JSON.stringify(regRes.body)}`);
    }

    // Test 3: Authenticated /auth/me route
    console.log('Test 3: Fetching user profile via token...');
    const meRes = await request(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    if (meRes.status === 200 && meRes.body.success && meRes.body.email === registerEmail) {
      console.log('✓ Token validation successful! Profile details matches registered user.\n');
    } else {
      throw new Error(`Profile fetch failed: ${JSON.stringify(meRes.body)}`);
    }

    // Test 4: Checkout Order
    console.log('Test 4: Simulating order checkout scheduling...');
    const checkoutRes = await request(`${baseUrl}/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: {
        items: [
          {
            productId: sampleProductId,
            tenure: 3,
            quantity: 1
          }
        ],
        shippingAddress: {
          street: '123 Test Lane',
          city: 'New York',
          state: 'NY',
          zipCode: '10001'
        },
        deliveryDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
        deliverySlot: '09:00 AM - 01:00 PM'
      }
    });

    if (checkoutRes.status === 201 && checkoutRes.body.success && checkoutRes.body.order) {
      console.log('✓ Order checkout succeeded!');
      console.log(`  Order Status: ${checkoutRes.body.order.status}`);
      console.log(`  Monthly Total: ₹${checkoutRes.body.order.totalMonthlyAmount}`);
      console.log(`  Deposit Total: ₹${checkoutRes.body.order.totalDeposit}\n`);
    } else {
      throw new Error(`Checkout failed: ${JSON.stringify(checkoutRes.body)}`);
    }

    console.log('=== All Integration Tests Passed Successfully! ===');
  } catch (error) {
    console.error(`✗ Test failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    if (child) {
      console.log('Shutting down server...');
      child.kill('SIGTERM');
      await new Promise((r) => setTimeout(r, 500));
    }
    process.exit(process.exitCode || 0);
  }
};

runTests();
