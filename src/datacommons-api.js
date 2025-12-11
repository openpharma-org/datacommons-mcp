const axios = require('axios');

// Data Commons natural language search API
const DC_SEARCH_BASE = 'https://datacommons.org';
const DC_API_BASE = 'https://api.datacommons.org/v2';

// Comprehensive place name to DCID mappings for all countries
// Format: country/[ISO-3166-1 alpha-3 code]
const PLACE_NAME_TO_DCID = {
  // === NORTH AMERICA ===
  'United States': 'country/USA',
  'United States of America': 'country/USA',
  'USA': 'country/USA',
  'US': 'country/USA',
  'Canada': 'country/CAN',
  'Mexico': 'country/MEX',

  // === US STATES ===
  'Alabama, USA': 'geoId/01',
  'Alaska, USA': 'geoId/02',
  'Arizona, USA': 'geoId/04',
  'Arkansas, USA': 'geoId/05',
  'California, USA': 'geoId/06',
  'Colorado, USA': 'geoId/08',
  'Connecticut, USA': 'geoId/09',
  'Delaware, USA': 'geoId/10',
  'Florida, USA': 'geoId/12',
  'Georgia, USA': 'geoId/13',
  'Hawaii, USA': 'geoId/15',
  'Idaho, USA': 'geoId/16',
  'Illinois, USA': 'geoId/17',
  'Indiana, USA': 'geoId/18',
  'Iowa, USA': 'geoId/19',
  'Kansas, USA': 'geoId/20',
  'Kentucky, USA': 'geoId/21',
  'Louisiana, USA': 'geoId/22',
  'Maine, USA': 'geoId/23',
  'Maryland, USA': 'geoId/24',
  'Massachusetts, USA': 'geoId/25',
  'Michigan, USA': 'geoId/26',
  'Minnesota, USA': 'geoId/27',
  'Mississippi, USA': 'geoId/28',
  'Missouri, USA': 'geoId/29',
  'Montana, USA': 'geoId/30',
  'Nebraska, USA': 'geoId/31',
  'Nevada, USA': 'geoId/32',
  'New Hampshire, USA': 'geoId/33',
  'New Jersey, USA': 'geoId/34',
  'New Mexico, USA': 'geoId/35',
  'New York, USA': 'geoId/36',
  'North Carolina, USA': 'geoId/37',
  'North Dakota, USA': 'geoId/38',
  'Ohio, USA': 'geoId/39',
  'Oklahoma, USA': 'geoId/40',
  'Oregon, USA': 'geoId/41',
  'Pennsylvania, USA': 'geoId/42',
  'Rhode Island, USA': 'geoId/44',
  'South Carolina, USA': 'geoId/45',
  'South Dakota, USA': 'geoId/46',
  'Tennessee, USA': 'geoId/47',
  'Texas, USA': 'geoId/48',
  'Utah, USA': 'geoId/49',
  'Vermont, USA': 'geoId/50',
  'Virginia, USA': 'geoId/51',
  'Washington, USA': 'geoId/53',
  'West Virginia, USA': 'geoId/54',
  'Wisconsin, USA': 'geoId/55',
  'Wyoming, USA': 'geoId/56',
  'District of Columbia, USA': 'geoId/11',
  'Washington DC, USA': 'geoId/11',
  'Washington, DC, USA': 'geoId/11',

  // === MAJOR US CITIES ===
  'New York City, USA': 'geoId/3651000',
  'Los Angeles, USA': 'geoId/0644000',
  'Chicago, USA': 'geoId/1714000',
  'Houston, USA': 'geoId/4835000',
  'Phoenix, USA': 'geoId/0455000',
  'Philadelphia, USA': 'geoId/4260000',
  'San Antonio, USA': 'geoId/4865000',
  'San Diego, USA': 'geoId/0666000',
  'Dallas, USA': 'geoId/4819000',
  'San Jose, USA': 'geoId/0668000',
  'Austin, USA': 'geoId/4805000',
  'Jacksonville, USA': 'geoId/1235000',
  'Fort Worth, USA': 'geoId/4827000',
  'Columbus, USA': 'geoId/3918000',
  'San Francisco, USA': 'geoId/0667000',
  'Charlotte, USA': 'geoId/3712000',
  'Indianapolis, USA': 'geoId/1836003',
  'Seattle, USA': 'geoId/5363000',
  'Denver, USA': 'geoId/0820000',
  'Boston, USA': 'geoId/2507000',

  // === CENTRAL AMERICA & CARIBBEAN ===
  'Guatemala': 'country/GTM',
  'Belize': 'country/BLZ',
  'Honduras': 'country/HND',
  'El Salvador': 'country/SLV',
  'Nicaragua': 'country/NIC',
  'Costa Rica': 'country/CRI',
  'Panama': 'country/PAN',
  'Cuba': 'country/CUB',
  'Jamaica': 'country/JAM',
  'Haiti': 'country/HTI',
  'Dominican Republic': 'country/DOM',
  'Trinidad and Tobago': 'country/TTO',
  'Bahamas': 'country/BHS',
  'Barbados': 'country/BRB',

  // === SOUTH AMERICA ===
  'Brazil': 'country/BRA',
  'Argentina': 'country/ARG',
  'Chile': 'country/CHL',
  'Colombia': 'country/COL',
  'Peru': 'country/PER',
  'Venezuela': 'country/VEN',
  'Ecuador': 'country/ECU',
  'Bolivia': 'country/BOL',
  'Paraguay': 'country/PRY',
  'Uruguay': 'country/URY',
  'Guyana': 'country/GUY',
  'Suriname': 'country/SUR',

  // === WESTERN EUROPE ===
  'United Kingdom': 'country/GBR',
  'UK': 'country/GBR',
  'Great Britain': 'country/GBR',
  'England': 'country/GBR',
  'Scotland': 'country/GBR',
  'Wales': 'country/GBR',
  'Northern Ireland': 'country/GBR',
  'Ireland': 'country/IRL',
  'France': 'country/FRA',
  'Germany': 'country/DEU',
  'Italy': 'country/ITA',
  'Spain': 'country/ESP',
  'Portugal': 'country/PRT',
  'Belgium': 'country/BEL',
  'Netherlands': 'country/NLD',
  'Luxembourg': 'country/LUX',
  'Switzerland': 'country/CHE',
  'Austria': 'country/AUT',
  'Greece': 'country/GRC',
  'Malta': 'country/MLT',
  'Cyprus': 'country/CYP',

  // === NORTHERN EUROPE ===
  'Sweden': 'country/SWE',
  'Norway': 'country/NOR',
  'Denmark': 'country/DNK',
  'Finland': 'country/FIN',
  'Iceland': 'country/ISL',
  'Estonia': 'country/EST',
  'Latvia': 'country/LVA',
  'Lithuania': 'country/LTU',

  // === EASTERN EUROPE ===
  'Poland': 'country/POL',
  'Czech Republic': 'country/CZE',
  'Czechia': 'country/CZE',
  'Slovakia': 'country/SVK',
  'Hungary': 'country/HUN',
  'Romania': 'country/ROU',
  'Bulgaria': 'country/BGR',
  'Slovenia': 'country/SVN',
  'Croatia': 'country/HRV',
  'Serbia': 'country/SRB',
  'Bosnia and Herzegovina': 'country/BIH',
  'Montenegro': 'country/MNE',
  'North Macedonia': 'country/MKD',
  'Macedonia': 'country/MKD',
  'Albania': 'country/ALB',
  'Ukraine': 'country/UKR',
  'Belarus': 'country/BLR',
  'Moldova': 'country/MDA',
  'Russia': 'country/RUS',
  'Russian Federation': 'country/RUS',

  // === MIDDLE EAST ===
  'Turkey': 'country/TUR',
  'Türkiye': 'country/TUR',
  'Israel': 'country/ISR',
  'Saudi Arabia': 'country/SAU',
  'UAE': 'country/ARE',
  'United Arab Emirates': 'country/ARE',
  'Qatar': 'country/QAT',
  'Kuwait': 'country/KWT',
  'Bahrain': 'country/BHR',
  'Oman': 'country/OMN',
  'Jordan': 'country/JOR',
  'Lebanon': 'country/LBN',
  'Syria': 'country/SYR',
  'Iraq': 'country/IRQ',
  'Iran': 'country/IRN',
  'Yemen': 'country/YEM',
  'Palestine': 'country/PSE',

  // === CENTRAL ASIA ===
  'Kazakhstan': 'country/KAZ',
  'Uzbekistan': 'country/UZB',
  'Turkmenistan': 'country/TKM',
  'Kyrgyzstan': 'country/KGZ',
  'Tajikistan': 'country/TJK',
  'Afghanistan': 'country/AFG',
  'Pakistan': 'country/PAK',

  // === SOUTH ASIA ===
  'India': 'country/IND',
  'Bangladesh': 'country/BGD',
  'Sri Lanka': 'country/LKA',
  'Nepal': 'country/NPL',
  'Bhutan': 'country/BTN',
  'Maldives': 'country/MDV',

  // === EAST ASIA ===
  'China': 'country/CHN',
  "People's Republic of China": 'country/CHN',
  'PRC': 'country/CHN',
  'Japan': 'country/JPN',
  'South Korea': 'country/KOR',
  'Korea': 'country/KOR',
  'Republic of Korea': 'country/KOR',
  'North Korea': 'country/PRK',
  'Mongolia': 'country/MNG',
  'Taiwan': 'country/TWN',
  'Hong Kong': 'country/HKG',
  'Macau': 'country/MAC',

  // === SOUTHEAST ASIA ===
  'Indonesia': 'country/IDN',
  'Thailand': 'country/THA',
  'Vietnam': 'country/VNM',
  'Philippines': 'country/PHL',
  'Malaysia': 'country/MYS',
  'Singapore': 'country/SGP',
  'Myanmar': 'country/MMR',
  'Burma': 'country/MMR',
  'Cambodia': 'country/KHM',
  'Laos': 'country/LAO',
  'Brunei': 'country/BRN',
  'Timor-Leste': 'country/TLS',
  'East Timor': 'country/TLS',

  // === OCEANIA ===
  'Australia': 'country/AUS',
  'New Zealand': 'country/NZL',
  'Papua New Guinea': 'country/PNG',
  'Fiji': 'country/FJI',
  'Solomon Islands': 'country/SLB',
  'Vanuatu': 'country/VUT',
  'Samoa': 'country/WSM',
  'Tonga': 'country/TON',

  // === NORTH AFRICA ===
  'Egypt': 'country/EGY',
  'Morocco': 'country/MAR',
  'Algeria': 'country/DZA',
  'Tunisia': 'country/TUN',
  'Libya': 'country/LBY',
  'Sudan': 'country/SDN',
  'South Sudan': 'country/SSD',

  // === WEST AFRICA ===
  'Nigeria': 'country/NGA',
  'Ghana': 'country/GHA',
  'Ivory Coast': 'country/CIV',
  "Côte d'Ivoire": 'country/CIV',
  'Senegal': 'country/SEN',
  'Mali': 'country/MLI',
  'Burkina Faso': 'country/BFA',
  'Niger': 'country/NER',
  'Guinea': 'country/GIN',
  'Benin': 'country/BEN',
  'Togo': 'country/TGO',
  'Sierra Leone': 'country/SLE',
  'Liberia': 'country/LBR',
  'Mauritania': 'country/MRT',
  'Gambia': 'country/GMB',
  'Guinea-Bissau': 'country/GNB',
  'Cape Verde': 'country/CPV',

  // === EAST AFRICA ===
  'Kenya': 'country/KEN',
  'Tanzania': 'country/TZA',
  'Uganda': 'country/UGA',
  'Ethiopia': 'country/ETH',
  'Somalia': 'country/SOM',
  'Rwanda': 'country/RWA',
  'Burundi': 'country/BDI',
  'Eritrea': 'country/ERI',
  'Djibouti': 'country/DJI',

  // === CENTRAL AFRICA ===
  'Democratic Republic of the Congo': 'country/COD',
  'DRC': 'country/COD',
  'Congo': 'country/COG',
  'Republic of the Congo': 'country/COG',
  'Cameroon': 'country/CMR',
  'Central African Republic': 'country/CAF',
  'Chad': 'country/TCD',
  'Gabon': 'country/GAB',
  'Equatorial Guinea': 'country/GNQ',

  // === SOUTHERN AFRICA ===
  'South Africa': 'country/ZAF',
  'Zimbabwe': 'country/ZWE',
  'Zambia': 'country/ZMB',
  'Mozambique': 'country/MOZ',
  'Angola': 'country/AGO',
  'Namibia': 'country/NAM',
  'Botswana': 'country/BWA',
  'Malawi': 'country/MWI',
  'Lesotho': 'country/LSO',
  'Eswatini': 'country/SWZ',
  'Swaziland': 'country/SWZ',
  'Madagascar': 'country/MDG',
  'Mauritius': 'country/MUS',
  'Seychelles': 'country/SYC',
  'Comoros': 'country/COM'
};

/**
 * Search for statistical variables and topics in Data Commons
 *
 * @param {Object} params - Search parameters
 * @param {string} params.query - Search query for indicators
 * @param {string[]} [params.places] - List of place names to filter by
 * @param {string} [params.parent_place] - Parent place for child sampling
 * @param {number} [params.per_search_limit=10] - Maximum results per search
 * @param {boolean} [params.include_topics=true] - Include topic hierarchy
 * @param {boolean} [params.maybe_bilateral=false] - Indicates bilateral relationships
 * @returns {Promise<Object>} Search results with variables and topics
 */
async function searchIndicators(params) {
  const {
    query,
    places = null,
    parent_place = null,
    per_search_limit = 10,
    include_topics = true,
    maybe_bilateral = false
  } = params;

  try {
    // Call Data Commons natural language search-indicators endpoint
    // Note: Using manual query string construction because axios doesn't serialize arrays correctly
    const queryParams = new URLSearchParams();
    queryParams.append('queries', query);  // Single query as string
    queryParams.append('limit_per_index', per_search_limit * 2);
    queryParams.append('index', 'base_uae_mem');  // Default index used by official client

    const response = await axios.get(
      `${DC_SEARCH_BASE}/api/nl/search-indicators?${queryParams.toString()}`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const data = response.data;

    // Transform response to match expected format
    const result = {
      variables: [],
      topics: [],
      dcid_name_mappings: {},
      dcid_place_type_mappings: {},
      status: 'SUCCESS'
    };

    // Resolve place names to DCIDs using mapping
    let placeDcids = [];
    if (places && places.length > 0) {
      for (const placeName of places) {
        // Try exact mapping first
        let placeDcid = PLACE_NAME_TO_DCID[placeName];

        // If not found and looks like already a DCID, use as-is
        if (!placeDcid && placeName.includes('/')) {
          placeDcid = placeName;
        }

        // If still not found, try case-insensitive matching
        if (!placeDcid) {
          const lowerName = placeName.toLowerCase();
          for (const [key, value] of Object.entries(PLACE_NAME_TO_DCID)) {
            if (key.toLowerCase() === lowerName) {
              placeDcid = value;
              break;
            }
          }
        }

        // Last resort: warn if unmapped place (likely needs to be added to mapping)
        if (!placeDcid) {
          console.error(`[Data Commons API] ⚠ Unknown place not in mapping: "${placeName}"`);
          console.error(`[Data Commons API] Please add to PLACE_NAME_TO_DCID mapping table`);
          placeDcid = placeName;  // Use as-is (will likely fail in get_observations)
        }

        placeDcids.push(placeDcid);
        result.dcid_name_mappings[placeDcid] = placeName;
      }
    }

    // Extract variables from search results
    // Response format: { queryResults: [{ query, indexResults: [{ index, results: [...] }] }] }
    if (data.queryResults && Array.isArray(data.queryResults)) {
      for (const queryResult of data.queryResults) {
        if (queryResult.indexResults && Array.isArray(queryResult.indexResults)) {
          for (const indexResult of queryResult.indexResults) {
            if (indexResult.results && Array.isArray(indexResult.results)) {
              for (const variable of indexResult.results.slice(0, per_search_limit)) {
                // Only include StatisticalVariables (not topics in this version)
                if (variable.typeOf === 'StatisticalVariable') {
                  const variableDcid = variable.dcid;
                  result.variables.push({
                    dcid: variableDcid,
                    places_with_data: placeDcids  // Use resolved DCIDs
                  });
                  result.dcid_name_mappings[variableDcid] = variable.name || variableDcid;
                } else if (include_topics && variable.typeOf === 'Topic') {
                  // Handle topics if requested
                  const topicDcid = variable.dcid;
                  result.topics.push({
                    dcid: topicDcid,
                    member_topics: variable.memberTopics || [],
                    member_variables: variable.memberVariables || [],
                    places_with_data: placeDcids  // Use resolved DCIDs
                  });
                  result.dcid_name_mappings[topicDcid] = variable.name || topicDcid;
                }
              }
            }
          }
        }
      }
    }

    // Handle parent place if provided
    if (parent_place) {
      result.resolved_parent_place = {
        dcid: parent_place,
        name: parent_place
      };
    }

    return result;

  } catch (error) {
    console.error('[Data Commons API] Search error:', error.message);
    if (error.response) {
      console.error('[Data Commons API] Response:', error.response.data);
    }
    throw new Error(`Data Commons search failed: ${error.message}`);
  }
}

/**
 * Get observations for a statistical variable
 *
 * @param {Object} params - Observation parameters
 * @param {string} params.variable_dcid - Variable DCID from search_indicators
 * @param {string} params.place_dcid - Place DCID
 * @param {string} [params.child_place_type] - Get data for all children of this type
 * @param {string} [params.source_override] - Force specific data source
 * @param {string} [params.date='latest'] - Date filter
 * @param {string} [params.date_range_start] - Start date for range
 * @param {string} [params.date_range_end] - End date for range
 * @returns {Promise<Object>} Observation data with time series
 */
async function getObservations(params) {
  const {
    variable_dcid,
    place_dcid,
    child_place_type = null,
    source_override = null,
    date = 'latest',
    date_range_start = null,
    date_range_end = null
  } = params;

  try {
    // Resolve place DCID using mapping
    let resolvedPlaceDcid = place_dcid;

    // If already a DCID (contains /), use as-is
    if (!place_dcid.includes('/')) {
      // Try exact mapping
      const mapped = PLACE_NAME_TO_DCID[place_dcid];
      if (mapped) {
        resolvedPlaceDcid = mapped;
      } else {
        // Try case-insensitive
        const lowerName = place_dcid.toLowerCase();
        for (const [key, value] of Object.entries(PLACE_NAME_TO_DCID)) {
          if (key.toLowerCase() === lowerName) {
            resolvedPlaceDcid = value;
            break;
          }
        }
      }

      if (resolvedPlaceDcid === place_dcid) {
        console.error('[Data Commons API] Unknown place:', place_dcid);
      }
    }

    // Determine entities to query
    let entities = [resolvedPlaceDcid];

    // If child_place_type specified, get all children
    if (child_place_type) {
      try {
        const childrenResponse = await axios.get(
          `${DC_API_BASE}/node/places-in`,
          {
            params: {
              dcids: resolvedPlaceDcid,
              placeType: child_place_type
            },
            headers: {
              'X-API-Key': process.env.DC_API_KEY || ''
            }
          }
        );

        if (childrenResponse.data && childrenResponse.data[resolvedPlaceDcid]) {
          entities = childrenResponse.data[resolvedPlaceDcid];
        }
      } catch (childError) {
        console.error('[Data Commons API] Child places fetch failed:', childError.message);
      }
    }

    // Build observation request for v2 API
    const requestBody = {
      select: ['entity', 'variable', 'value', 'date'],
      entity: { dcids: entities },
      variable: { dcids: [variable_dcid] }
    };

    // Call Data Commons /v2/observation endpoint
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

    const data = response.data;

    // Transform response to match expected format
    const result = {
      variable: {
        dcid: variable_dcid,
        name: variable_dcid  // Will be updated from data if available
      },
      place_observations: [],
      source_metadata: {},
      alternative_sources: []
    };

    // Parse v2 observation response format
    // Response has { facets: {}, byVariable: {[varDcid]: {byEntity: {[entityDcid]: {orderedFacets: [...]}}}}}
    if (data.byVariable && data.byVariable[variable_dcid]) {
      const variableData = data.byVariable[variable_dcid];

      for (const entityDcid of entities) {
        const entityData = variableData.byEntity?.[entityDcid];

        if (entityData && entityData.orderedFacets && entityData.orderedFacets.length > 0) {
          // Get primary facet (best quality source)
          const primaryFacet = entityData.orderedFacets[0];
          const facetId = primaryFacet.facetId;
          const facetMetadata = data.facets?.[facetId] || {};

          // Get observations from facet
          const observations = primaryFacet.observations || [];

          // Convert observations to time series (date, value) tuples
          // Sort by date descending (latest first)
          const time_series = observations
            .map(obs => [obs.date || '', parseFloat(obs.value) || 0])
            .sort((a, b) => b[0].localeCompare(a[0]));

          result.place_observations.push({
            place: {
              dcid: entityDcid,
              name: entityDcid,  // Name will be resolved from metadata if available
              type: ''
            },
            time_series
          });

          // Extract source metadata from primary facet
          if (!result.source_metadata.import_name) {
            result.source_metadata = {
              import_name: facetMetadata.importName || 'Data Commons',
              measurement_method: facetMetadata.measurementMethod || '',
              observation_period: facetMetadata.observationPeriod || ''
            };
          }
        }
      }
    }

    return result;

  } catch (error) {
    console.error('[Data Commons API] Observation error:', error.message);
    if (error.response) {
      console.error('[Data Commons API] Response:', error.response.data);
    }
    throw new Error(`Data Commons observation retrieval failed: ${error.message}`);
  }
}

module.exports = {
  searchIndicators,
  getObservations
};
