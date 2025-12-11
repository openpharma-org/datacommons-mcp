const axios = require('axios');

const DC_API_BASE = 'https://api.datacommons.org/v2';

async function testDirectObservation() {
  console.log('Testing observations with place name directly...\n');

  // Try 1: "United States"
  console.log('=== Try 1: "United States" ===');
  await testObservation(['United States']);

  // Try 2: "country/USA"
  console.log('\n=== Try 2: "country/USA" ===');
  await testObservation(['country/USA']);

  // Try 3: "USA"
  console.log('\n=== Try 3: "USA" ===');
  await testObservation(['USA']);
}

async function testObservation(entities) {
  const requestBody = {
    select: ['entity', 'variable', 'value', 'date'],
    entity: { dcids: entities },
    variable: { dcids: ['Percent_Person_Obesity'] }
  };

  try {
    const response = await axios.post(
      `${DC_API_BASE}/observation`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.DC_API_KEY || ''
        }
      }
    );

    console.log('Success!');
    console.log('Entities requested:', entities);

    if (response.data.byVariable && response.data.byVariable['Percent_Person_Obesity']) {
      const variableData = response.data.byVariable['Percent_Person_Obesity'];
      console.log('Entities found:', Object.keys(variableData.byEntity || {}));

      for (const entityDcid in variableData.byEntity) {
        const entityData = variableData.byEntity[entityDcid];
        if (entityData.orderedFacets && entityData.orderedFacets.length > 0) {
          const observations = entityData.orderedFacets[0].observations || [];
          console.log(`  ${entityDcid}: ${observations.length} observations`);
          if (observations.length > 0) {
            console.log(`    Latest: ${observations[0].date} = ${observations[0].value}`);
          }
        }
      }
    } else {
      console.log('No data in byVariable');
    }
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
    }
  }
}

testDirectObservation();
