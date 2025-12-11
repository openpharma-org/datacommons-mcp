const axios = require('axios');

console.log('=== Testing Axios Query String Serialization ===\n');

// Scenario 1: Axios default serialization
console.log('1. Axios default params serialization:');
const axiosUrl = axios.getUri({
  url: 'https://datacommons.org/api/nl/search-indicators',
  params: {
    queries: 'obesity prevalence',
    limit_per_index: 20,
    index: 'base_uae_mem'
  }
});
console.log('  Result:', axiosUrl);
console.log('  Problem: ❌ Creates correct format for simple params');
console.log();

// Scenario 2: What if queries was an array?
console.log('2. Axios with array parameter:');
const axiosArrayUrl = axios.getUri({
  url: 'https://datacommons.org/api/nl/search-indicators',
  params: {
    queries: ['obesity prevalence', 'diabetes prevalence'],
    limit_per_index: 20
  }
});
console.log('  Result:', axiosArrayUrl);
console.log('  Problem: ✓ Arrays get [] notation (queries[0]=...&queries[1]=...)');
console.log();

// Scenario 3: URLSearchParams (our solution)
console.log('3. URLSearchParams manual construction:');
const queryParams = new URLSearchParams();
queryParams.append('queries', 'obesity prevalence');
queryParams.append('limit_per_index', '20');
queryParams.append('index', 'base_uae_mem');
const manualUrl = `https://datacommons.org/api/nl/search-indicators?${queryParams.toString()}`;
console.log('  Result:', manualUrl);
console.log('  Solution: ✓ Clean key=value format, no array notation');
console.log();

// Scenario 4: What Data Commons API expects
console.log('4. What Data Commons API requires:');
console.log('  Expected: ?queries=obesity+prevalence&limit_per_index=20');
console.log('  Rejects:  ?queries[]=obesity+prevalence (array notation)');
console.log('  Rejects:  ?queries[0]=obesity+prevalence (indexed array)');
console.log();

console.log('=== Conclusion ===');
console.log('Axios default serialization works for strings, but...');
console.log('The API documentation suggests "queries" as if it were an array,');
console.log('but actually requires a single string value without array notation.');
console.log('URLSearchParams gives us explicit control over the format.');
