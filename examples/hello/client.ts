import { createS402Fetch } from '@s402/fetch';
import { PRIVATE_KEY, PUBLIC_KEY, KEY_ID } from './keys';

const SERVER_URL = 'http://localhost:3000';

async function main() {
  console.log('\n🔵 S402 Client starting...\n');
  console.log(`👤 Client public key: ${PUBLIC_KEY}\n`);
  
  // Create s402 fetch wrapper with signing and auto-payment enabled
  const s402Fetch = createS402Fetch({
    privateKey: PRIVATE_KEY,
    publicKey: PUBLIC_KEY,
    keyId: KEY_ID,
    signRequests: true,
    autoPayment: true  // Automatically send payment on 402 responses
  });
  
  // Also create unsigned fetch for comparison
  const unsignedFetch = createS402Fetch({
    signRequests: false
  });

  try {
    // Test 1: Health endpoint (no signature required)
    console.log('1. Testing health endpoint (no signature)...');
    const healthResponse = await unsignedFetch(`${SERVER_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('   ✅ Health check:', healthData);
    console.log('');

    // Test 2: Protected endpoint without signature (should fail with 401)
    console.log('2. Testing protected endpoint WITHOUT signature (should be rejected)...');
    try {
      const unsignedResponse = await unsignedFetch(`${SERVER_URL}/api/data`);
      if (unsignedResponse.ok) {
        console.log('   ⚠️  Unexpected: Request succeeded without signature');
      } else {
        const errorData = await unsignedResponse.json() as { error?: string; message?: string };
        console.log(`   ✅ Expected rejection: ${unsignedResponse.status} ${unsignedResponse.statusText}`);
        console.log(`   Message: ${errorData.message || errorData.error}`);
      }
    } catch (error) {
      console.log('   ✅ Request rejected as expected');
    }
    console.log('');

    // Test 3: Protected endpoint WITH signature but no payment (should get 402, then auto-pay)
    console.log('3. Testing protected endpoint WITH signature (first request - will trigger payment)...');
    const dataResponse1 = await s402Fetch(`${SERVER_URL}/api/data`);
    
    if (dataResponse1.ok) {
      const data = await dataResponse1.json();
      console.log('   ✅ Success! Received data:', data);
    } else {
      console.error('   ❌ Failed:', dataResponse1.status, dataResponse1.statusText);
      const errorText = await dataResponse1.text();
      console.error('   Error details:', errorText);
    }
    console.log('');

    // Test 4: Immediate second request (should use cached credits)
    console.log('4. Testing immediate second request (should use cached credits)...');
    const dataResponse2 = await s402Fetch(`${SERVER_URL}/api/data`);
    
    if (dataResponse2.ok) {
      const data = await dataResponse2.json();
      console.log('   ✅ Success! Received data:', data);
      console.log('   ✅ Credits were cached - no blockchain check needed!');
    } else {
      console.error('   ❌ Failed:', dataResponse2.status, dataResponse2.statusText);
      const errorText = await dataResponse2.text();
      console.error('   Error details:', errorText);
    }
    console.log('');

    // Test 5: Third request (still within subscription time)
    console.log('5. Testing third request (still within subscription time)...');
    const dataResponse3 = await s402Fetch(`${SERVER_URL}/api/data`);
    
    if (dataResponse3.ok) {
      const data = await dataResponse3.json();
      console.log('   ✅ Success! Received data:', data);
    } else {
      console.error('   ❌ Failed:', dataResponse3.status, dataResponse3.statusText);
    }

  } catch (error) {
    console.error('❌ Request failed:', error);
  }
  
  console.log('\n🔵 Client finished.\n');
}

main();
