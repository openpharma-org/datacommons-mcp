const axios = require('axios');

const DC_API_BASE = 'https://api.datacommons.org/v2';

async function testResolveProperties() {
  console.log('Testing different /v2/resolve property values...\n');

  // Test cases from Data Commons documentation
  const testCases = [
    { property: '<-description', desc: 'Reverse description (common pattern)' },
    { property: '->', desc: 'Default forward property' },
    { property: 'name', desc: 'Name property' },
    { property: 'description', desc: 'Description property' },
    { property: '<-name', desc: 'Reverse name' },
    { property: 'dcid', desc: 'DCID property' },
    { property: '', desc: 'Empty property' }
  ];

  for (const testCase of testCases) {
    console.log(`=== Testing: ${testCase.desc} (property: "${testCase.property}") ===`);

    try {
      const response = await axios.post(
        `${DC_API_BASE}/resolve`,
        {
          nodes: ['United States'],
          property: testCase.property
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': process.env.DC_API_KEY || ''
          }
        }
      );

      console.log('✓ SUCCESS!');
      console.log('Response:', JSON.stringify(response.data, null, 2));

      const entities = response.data.entities || [];
      if (entities.length > 0 && entities[0].candidates?.length > 0) {
        console.log('Resolved DCID:', entities[0].candidates[0].dcid);
      }
    } catch (error) {
      console.log('✗ FAILED');
      console.log('Error:', error.response?.data?.message || error.message);
    }
    console.log();
  }
}

testResolveProperties();
