const axios = require('axios');

const DC_API_BASE = 'https://api.datacommons.org/v2';

async function testObservations() {
  console.log('Testing Data Commons observations API...\n');

  const requestBody = {
    select: ['entity', 'variable', 'value', 'date'],
    entity: { dcids: ['country/USA'] },
    variable: { dcids: ['Percent_Person_Obesity'] }
  };

  console.log('Request:', JSON.stringify(requestBody, null, 2));

  try {
    const response = await axios.post(
      `${DC_API_BASE}/observation`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.DC_API_KEY || 'DDrhPJrXPhZRNb0jC42n6vFyZecSn5w8y1lTYCgIljtOOGHt'
        }
      }
    );

    console.log('\nResponse:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testObservations();
