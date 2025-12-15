# Unofficial Data Commons MCP Server

A Model Context Protocol (MCP) server providing access to the Data Commons knowledge graph. This server enables AI assistants to search and retrieve statistical and demographic data through natural language queries, including population statistics, disease burden data, epidemiological indicators, and economic metrics.

## Features

### Statistical Data Access
- **Natural Language Search** - Query Data Commons using natural language for statistical variables and topics
- **Population Statistics** - Access demographic data for countries, states, counties, and cities
- **Disease Burden Data** - Retrieve epidemiological indicators and health statistics
- **Economic Metrics** - Query GDP, employment, trade, and other economic indicators
- **Time Series Data** - Get historical observations with dates and values
- **Multi-Geography Support** - Access data for 190+ countries and 100+ US cities

### Data Intelligence
- **Two-Step Workflow** - Search indicators first, then retrieve observations for validated combinations
- **Place Name Resolution** - Automatically maps human-readable place names to Data Commons identifiers
- **Multiple Data Sources** - Access data from CDC, World Bank, US Census, and more
- **Topic Hierarchy** - Explore related statistical variables through topic organization
- **Flexible Date Filtering** - Retrieve latest data, all historical data, or specific date ranges

## Configuration

### MCP Client Setup

Add to your MCP client configuration (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "datacommons": {
      "command": "node",
      "args": ["path/to/datacommons-mcp/src/index.js"],
      "env": {
        "DC_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### Environment Variables

- `DC_API_KEY` (optional): Data Commons API key for enhanced rate limits
  - Not required for basic functionality
  - Recommended for high-volume usage
  - Get your API key at: https://apikeys.datacommons.org/

## Available Tools

The Data Commons MCP Server provides two main tools following a two-step workflow:

### STEP 1: `search_indicators`

Search for statistical variables (indicators) and topics in the Data Commons Knowledge Graph.

**Description**: Search for variables and topics related to your query. This is always the first step before retrieving observations.

**Parameters**:
- `query` (required): Search query string
  - Examples: "diabetes prevalence", "population", "GDP", "carbon emissions"
  - Best practice: Search ONE concept at a time for focused results
- `places` (optional): List of human-readable place names
  - Format: Always qualify place names with geography
  - Examples: `["California, USA"]`, `["Paris, France"]`, `["New York City, USA"]`
  - NEVER use DCIDs here (e.g., "geoId/06", "country/CAN")
- `parent_place` (optional): Parent place for child sampling
  - Use when searching for indicators about child places
  - Example: `parent_place="India"` with `places=[sample of states]`
- `per_search_limit` (optional): Maximum results per search (1-100, default: 10)
- `include_topics` (optional): Include topic hierarchy (default: true)
  - Use `true` for exploration/discovery
  - Use `false` for specific data fetching
- `maybe_bilateral` (optional): For bilateral relationships (default: false)
  - Use `true` for: trade, migration, exports between places
  - Use `false` for: properties of a place (population, GDP, unemployment)

**Example Usage**:

```json
{
  "query": "diabetes prevalence",
  "places": ["California, USA"],
  "per_search_limit": 10,
  "include_topics": true
}
```

**Returns**:
- List of matching statistical variables with DCIDs
- Place name to DCID mappings
- Topic hierarchy for exploration
- Available data sources and metadata

### STEP 2: `get_observations`

Fetch observation data for a statistical variable.

**Description**: Retrieve actual measurements (time series data) for a specific variable-place combination. Always use `search_indicators` first to validate the combination.

**Parameters**:
- `variable_dcid` (required): Variable DCID from `search_indicators` response
  - Format: "Count_Person", "Percent_Person_Obesity", etc.
  - NEVER guess - must come from `search_indicators`
- `place_dcid` (required): Place DCID from `search_indicators` response
  - Format: "country/USA", "geoId/06" (California), "geoId/3651000" (NYC)
  - Get from `places_with_data` in `search_indicators` response
- `child_place_type` (optional): Get data for all children of this type
  - Examples: "County", "Country", "City", "State"
  - MUST validate with `search_indicators` first
- `source_override` (optional): Force specific data source
  - Examples: "CDC_BRFSS", "WorldBank", "USCensus"
- `date` (optional): Date filter (default: "latest")
  - Values: "latest", "all", "range", "YYYY", "YYYY-MM", "YYYY-MM-DD"
  - When using `child_place_type`, use "latest" or date range, NOT "all"
- `date_range_start` (optional): Start date for range (YYYY, YYYY-MM, or YYYY-MM-DD)
  - Only when `date="range"`
- `date_range_end` (optional): End date for range (YYYY, YYYY-MM, or YYYY-MM-DD)
  - Only when `date="range"`

**Example Usage**:

```json
{
  "variable_dcid": "Percent_Person_Obesity",
  "place_dcid": "geoId/06",
  "date": "latest"
}
```

**Example with Child Places**:

```json
{
  "variable_dcid": "Count_Person",
  "place_dcid": "country/USA",
  "child_place_type": "State",
  "date": "2020"
}
```

**Returns**:
- Time series data with date-value pairs
- Data source information
- Place observations for child places (if requested)

## Usage Examples

### Basic Search and Retrieval

Search for diabetes prevalence data in California:

```
1. Search for indicators:
   query: "diabetes prevalence"
   places: ["California, USA"]

2. Get observations using DCIDs from step 1:
   variable_dcid: "Percent_Person_Obesity"
   place_dcid: "geoId/06"
   date: "latest"
```

### Multi-Geography Analysis

Compare population across multiple cities:

```
1. Search for population indicator:
   query: "population"
   places: ["New York City, USA", "Los Angeles, USA", "Chicago, USA"]

2. Get observations for each city using returned DCIDs
```

### Time Series Analysis

Get historical GDP data:

```
1. Search for GDP indicator:
   query: "GDP"
   places: ["United States"]

2. Get all historical data:
   variable_dcid: "Amount_EconomicActivity_GrossDomesticProduction_Nominal"
   place_dcid: "country/USA"
   date: "all"
```

### Child Place Analysis

Get county-level data for a state:

```
1. Search and validate:
   query: "unemployment rate"
   places: ["California, USA"]

2. Get data for all counties:
   variable_dcid: [from step 1]
   place_dcid: "geoId/06"
   child_place_type: "County"
   date: "latest"
```

## Common Statistical Variables

### Population & Demographics
- **Count_Person** - Total population count
- **Median_Age_Person** - Median age
- **Count_Person_Female** - Female population
- **Count_Person_Male** - Male population

### Health Indicators
- **Percent_Person_Obesity** - Obesity prevalence
- **Percent_Person_WithDiabetes** - Diabetes prevalence
- **Percent_Person_WithHighBloodPressure** - Hypertension prevalence
- **Count_Death** - Mortality statistics

### Economic Metrics
- **Amount_EconomicActivity_GrossDomesticProduction_Nominal** - GDP
- **UnemploymentRate_Person** - Unemployment rate
- **Median_Income_Household** - Median household income
- **Count_Person_Employed** - Employment count

### Environmental Data
- **Annual_Emissions_GreenhouseGas** - Greenhouse gas emissions
- **Concentration_AirPollutant_PM2.5** - Air quality (PM2.5)
- **Mean_Temperature** - Temperature data

## Supported Geographies

### Global Coverage
- **190+ Countries** - All continents (North America, South America, Europe, Asia, Africa, Oceania)
- **Regional Groupings** - Multi-country analysis support

### United States Coverage
- **All 50 States** - State-level data with county breakdowns
- **100+ Major Cities** - Including NYC, Los Angeles, Chicago, Houston, Phoenix, and more
- **Counties & Census Tracts** - Fine-grained geographic analysis
- **ZIP Codes (ZCTA)** - Postal code-level data

### Place Name Examples

The server automatically maps human-readable names to Data Commons IDs:

```
"United States" → country/USA
"California, USA" → geoId/06
"New York City, USA" → geoId/3651000
"United Kingdom" or "UK" → country/GBR
"France" → country/FRA
```

## API Integration

This server integrates with the Data Commons API:

### Endpoints Used

- **Natural Language Search**: `https://datacommons.org/api/nl/search-indicators`
  - Semantic search for statistical variables
  - Place name resolution
  - Topic discovery

- **Observations**: `https://api.datacommons.org/v2/observation`
  - Time series data retrieval
  - Multi-place queries
  - Source metadata

- **Place Resolution**: `https://api.datacommons.org/v2/resolve`
  - Human-readable names to DCIDs
  - Multiple name variations

- **Child Places**: `https://api.datacommons.org/v2/node/places-in`
  - Geographic hierarchy queries
  - Child place enumeration

### Authentication

- Optional `DC_API_KEY` environment variable
- Passed in `X-API-Key` header for API v2 endpoints
- Natural language search doesn't require authentication

### Rate Limiting

- Conservative usage patterns built-in
- API key recommended for high-volume usage
- Automatic retry with exponential backoff

## Data Sources

Data Commons aggregates data from trusted sources:

- **CDC** - Centers for Disease Control and Prevention
- **World Bank** - Global economic and development data
- **US Census** - Population and demographic statistics
- **OECD** - Economic and social statistics
- **WHO** - World Health Organization health data
- **UN** - United Nations statistical databases
- **EPA** - Environmental Protection Agency data
- **And many more...**

## Common Issues

### Place Name Not Found

**Problem**: Search returns no results for a place
**Solution**: Always qualify place names with geography
- ✅ "California, USA"
- ❌ "California"

### Variable-Place Combination Invalid

**Problem**: No data available for variable-place combination
**Solution**: Always use `search_indicators` first to validate

### Too Much Data

**Problem**: Query returns overwhelming amount of data
**Solution**: Use date filters and avoid `date="all"` with `child_place_type`

## Resources

- **Data Commons**: https://datacommons.org/
- **Data Commons API Documentation**: https://docs.datacommons.org/api/
- **OpenPharma GitHub**: https://github.com/openpharma-org