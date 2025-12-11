const axios = require('axios');

const DC_API_BASE = 'https://api.datacommons.org/v2';

async function testPlaceResolution() {
  console.log('Testing place resolution...\n');

  try {
    const resolveResponse = await axios.post(
      `${DC_API_BASE}/resolve`,
      {
        nodes: ['United States'],
        property: '->'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.DC_API_KEY || ''
        }
      }
    );

    console.log('Response:', JSON.stringify(resolveResponse.data, null, 2));

    // Extract DCIDs
    const entities = resolveResponse.data.entities || [];
    console.log('\nExtracted entities:');
    for (const entity of entities) {
      console.log(`  Input: ${entity.node}`);
      const candidates = entity.candidates || [];
      if (candidates.length > 0) {
        console.log(`  DCID: ${candidates[0].dcid}`);
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testPlaceResolution();
