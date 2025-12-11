#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const {
  searchIndicators,
  getObservations
} = require('./datacommons-api.js');

const server = new Server(
  {
    name: 'datacommons-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'search_indicators',
        description: 'Search for statistical variables (indicators) and topics in Data Commons Knowledge Graph. CRITICAL: This is STEP 1 - Always use this before get_observations! Results are CANDIDATES - filter and rank based on user context.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query for indicators. Examples: "diabetes prevalence", "population", "GDP", "carbon emissions". RULES: Search ONE concept at a time for focused results.',
              examples: ['diabetes prevalence', 'population', 'GDP', 'unemployment rate']
            },
            places: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of human-readable place names (optional). CRITICAL: ALWAYS qualify place names with geography. Examples: ["California, USA"], ["Paris, France"], ["New York City, USA"]. NEVER use DCIDs here (e.g., "geoId/06", "country/CAN").',
              examples: [['United States'], ['California, USA'], ['New York City, USA', 'Los Angeles, USA']]
            },
            parent_place: {
              type: 'string',
              description: 'Parent place for child sampling (optional). Use ONLY when searching for indicators about child places. Example: parent_place="India", places=[sample of states]',
              examples: ['India', 'United States', 'World']
            },
            per_search_limit: {
              type: 'number',
              description: 'Maximum results per search (1-100, default: 10). ONLY set when explicitly requested by user.',
              default: 10,
              minimum: 1,
              maximum: 100
            },
            include_topics: {
              type: 'boolean',
              description: 'Include topic hierarchy (default: true). Use true for exploration/discovery. Use false for specific data fetching.',
              default: true
            },
            maybe_bilateral: {
              type: 'boolean',
              description: 'Set true for bilateral relationships (default: false). Use true for: trade, migration, exports between places. Use false for: properties of a place (population, GDP, unemployment).',
              default: false
            }
          },
          required: ['query']
        }
      },
      {
        name: 'get_observations',
        description: 'Fetch observations for a statistical variable. CRITICAL: This is STEP 2 - Use after search_indicators! ALWAYS validate variable-place combinations with search_indicators first!',
        inputSchema: {
          type: 'object',
          properties: {
            variable_dcid: {
              type: 'string',
              description: 'Variable DCID from search_indicators. Format: "dc/v/VariableName" or similar. NEVER guess - must come from search_indicators.',
              examples: ['Count_Person', 'Percent_Person_Obesity', 'Amount_EconomicActivity_GrossDomesticProduction_Nominal']
            },
            place_dcid: {
              type: 'string',
              description: 'Place DCID from search_indicators response. Format: "geoId/06" (California), "country/USA", etc. Get from places_with_data in search_indicators response.',
              examples: ['country/USA', 'geoId/06', 'geoId/3651000']
            },
            child_place_type: {
              type: 'string',
              description: 'Get data for all children of this type (optional). CRITICAL: MUST validate with search_indicators first! Examples: "County", "Country", "City".',
              examples: ['County', 'Country', 'City', 'State']
            },
            source_override: {
              type: 'string',
              description: 'Force specific data source (optional)',
              examples: ['CDC_BRFSS', 'WorldBank', 'USCensus']
            },
            date: {
              type: 'string',
              description: 'Date filter (required, default: "latest"). Values: "latest" (most recent), "all" (all dates), "range" (use date_range_start/end), "YYYY", "YYYY-MM", "YYYY-MM-DD". DATA VOLUME CONSTRAINT: When using child_place_type, MUST be conservative - use "latest" or specific date range, NOT "all".',
              default: 'latest',
              examples: ['latest', 'all', 'range', '2020', '2020-06', '2020-06-15']
            },
            date_range_start: {
              type: 'string',
              description: 'Start date for range (YYYY, YYYY-MM, or YYYY-MM-DD). Only if date="range"',
              examples: ['2010', '2010-01', '2010-01-01']
            },
            date_range_end: {
              type: 'string',
              description: 'End date for range (YYYY, YYYY-MM, or YYYY-MM-DD). Only if date="range"',
              examples: ['2020', '2020-12', '2020-12-31']
            }
          },
          required: ['variable_dcid', 'place_dcid']
        }
      }
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;

    switch (name) {
      case 'search_indicators':
        result = await searchIndicators(args);
        break;

      case 'get_observations':
        result = await getObservations(args);
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    console.error(`[MCP Server] Error in ${name}:`, error.message);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: error.message,
            tool: name,
            arguments: args
          }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[MCP Server] Data Commons MCP server running on stdio');
}

main().catch((error) => {
  console.error('[MCP Server] Fatal error:', error);
  process.exit(1);
});
