const { spawn } = require('child_process');

// Spawn the MCP server
const server = spawn('node', ['/Users/joan.saez-pons/code/datacommons-mcp/src/index.js'], {
  env: {
    ...process.env,
    DC_API_KEY: 'DDrhPJrXPhZRNb0jC42n6vFyZecSn5w8y1lTYCgIljtOOGHt'
  }
});

// Collect responses
let responseBuffer = '';

server.stdout.on('data', (data) => {
  responseBuffer += data.toString();
  // Try to parse complete JSON-RPC messages
  const lines = responseBuffer.split('\n');
  responseBuffer = lines.pop(); // Keep incomplete line in buffer

  for (const line of lines) {
    if (line.trim()) {
      try {
        const response = JSON.parse(line);
        console.log('=== Response ===');
        console.log(JSON.stringify(response, null, 2));
      } catch (e) {
        console.log('Non-JSON output:', line);
      }
    }
  }
});

server.stderr.on('data', (data) => {
  console.error('Server stderr:', data.toString());
});

// Wait for server to start
setTimeout(() => {
  console.log('\n=== Sending search_indicators request ===');
  const request = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'search_indicators',
      arguments: {
        query: 'obesity prevalence',
        per_search_limit: 5
      }
    }
  };

  server.stdin.write(JSON.stringify(request) + '\n');

  // Wait for response, then exit
  setTimeout(() => {
    server.kill();
    process.exit(0);
  }, 3000);
}, 1000);
