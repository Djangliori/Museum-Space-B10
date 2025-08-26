export default async function handler(req, res) {
  // CORS headers
  const origin = req.headers.origin;
  const allowedOrigins = ['https://betlemi10.com', 'https://www.betlemi10.com', 'http://localhost:3000', 'http://localhost:5173'];
  if (allowedOrigins.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const merchantId = process.env.UNIPAY_MERCHANT_ID;
    const apiKey = process.env.UNIPAY_API_KEY;

    // Enhanced diagnostics
    const diagnostics = {
      timestamp: new Date().toISOString(),
      vercel_region: process.env.VERCEL_REGION || 'unknown',
      vercel_env: process.env.VERCEL_ENV || 'unknown',
      node_version: process.version,
      
      // Environment variables analysis
      merchant_id_analysis: {
        configured: !!merchantId,
        expected: "5015191030581",
        matches_expected: merchantId === "5015191030581",
        actual_value: merchantId || 'NOT_SET',
        length: merchantId ? merchantId.length : 0,
        type: typeof merchantId,
        has_whitespace: merchantId ? /\s/.test(merchantId) : false,
        starts_ends_with_quotes: merchantId ? (merchantId.startsWith('"') || merchantId.startsWith("'") || merchantId.endsWith('"') || merchantId.endsWith("'")) : false
      },

      api_key_analysis: {
        configured: !!apiKey,
        expected_format: "bc6f5073-6d1c-4abe-8456-1bb814077f6e",
        matches_expected: apiKey === "bc6f5073-6d1c-4abe-8456-1bb814077f6e",
        masked_value: apiKey ? `${apiKey.substring(0, 8)}***${apiKey.substring(apiKey.length - 8)}` : 'NOT_SET',
        length: apiKey ? apiKey.length : 0,
        expected_length: 36,
        length_matches: apiKey ? apiKey.length === 36 : false,
        type: typeof apiKey,
        has_dashes: apiKey ? apiKey.includes('-') : false,
        dash_count: apiKey ? (apiKey.match(/-/g) || []).length : 0,
        expected_dash_count: 4,
        dash_count_matches: apiKey ? (apiKey.match(/-/g) || []).length === 4 : false,
        has_whitespace: apiKey ? /\s/.test(apiKey) : false,
        starts_ends_with_quotes: apiKey ? (apiKey.startsWith('"') || apiKey.startsWith("'") || apiKey.endsWith('"') || apiKey.endsWith("'")) : false,
        is_uuid_format: apiKey ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(apiKey) : false,
        character_analysis: apiKey ? {
          all_chars_valid: /^[0-9a-f-]+$/i.test(apiKey),
          invalid_chars: apiKey.split('').filter(char => !/[0-9a-f-]/i.test(char)),
          char_codes: apiKey.split('').map((char, index) => ({ index, char, code: char.charCodeAt(0) }))
        } : null
      },

      // All environment variables (for debugging)
      all_env_vars: Object.keys(process.env)
        .filter(key => key.includes('UNIPAY') || key.includes('MERCHANT') || key.includes('API'))
        .reduce((acc, key) => {
          const value = process.env[key];
          acc[key] = {
            configured: !!value,
            length: value ? value.length : 0,
            type: typeof value,
            masked: value ? (value.length > 10 ? `${value.substring(0, 4)}***${value.substring(value.length - 4)}` : '***') : 'NOT_SET'
          };
          return acc;
        }, {}),

      // Configuration status
      configuration_status: {
        both_configured: !!(merchantId && apiKey),
        merchant_id_valid: merchantId === "5015191030581",
        api_key_format_valid: apiKey ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(apiKey) : false,
        ready_for_testing: !!(merchantId && apiKey && merchantId === "5015191030581" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(apiKey))
      }
    };

    // Test API connectivity and authentication
    let connectivity_test = { status: 'UNKNOWN', details: '' };
    let auth_test = { status: 'UNKNOWN', details: '', response_analysis: null };

    try {
      // Test 1: API endpoint connectivity
      const connectivityResponse = await fetch('https://apiv2.unipay.com/v3/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      connectivity_test = {
        status: connectivityResponse.status === 400 ? 'REACHABLE' : `HTTP_${connectivityResponse.status}`,
        details: `API endpoint is reachable, returned status ${connectivityResponse.status}`
      };

      // Test 2: Authentication with current environment variables
      if (merchantId && apiKey) {
        const authResponse = await fetch('https://apiv2.unipay.com/v3/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            merchant_id: merchantId,
            api_key: apiKey
          })
        });

        const responseText = await authResponse.text();
        let responseData = null;
        try {
          responseData = JSON.parse(responseText);
        } catch (e) {
          responseData = { raw_response: responseText };
        }

        auth_test = {
          status: authResponse.ok ? 'SUCCESS' : `FAILED_${authResponse.status}`,
          details: authResponse.ok 
            ? `Authentication successful, token received: ${responseData.token ? 'YES' : 'NO'}`
            : `Authentication failed with status ${authResponse.status}: ${responseText}`,
          response_analysis: {
            status_code: authResponse.status,
            ok: authResponse.ok,
            headers: Object.fromEntries(authResponse.headers.entries()),
            response_body: responseData,
            has_token: responseData && responseData.token ? true : false,
            token_length: responseData && responseData.token ? responseData.token.length : 0
          }
        };

        // Test 3: Authentication with expected credentials (for comparison)
        if (req.method === 'POST') {
          try {
            const expectedAuthResponse = await fetch('https://apiv2.unipay.com/v3/auth', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                merchant_id: "5015191030581",
                api_key: "bc6f5073-6d1c-4abe-8456-1bb814077f6e"
              })
            });
            
            const expectedResponseText = await expectedAuthResponse.text();
            let expectedResponseData = null;
            try {
              expectedResponseData = JSON.parse(expectedResponseText);
            } catch (e) {
              expectedResponseData = { raw_response: expectedResponseText };
            }

            diagnostics.expected_credentials_test = {
              status: expectedAuthResponse.ok ? 'SUCCESS' : `FAILED_${expectedAuthResponse.status}`,
              details: expectedAuthResponse.ok 
                ? `Expected credentials work: token received: ${expectedResponseData.token ? 'YES' : 'NO'}`
                : `Expected credentials failed with status ${expectedAuthResponse.status}: ${expectedResponseText}`,
              comparison_with_env: {
                env_works: auth_test.status === 'SUCCESS',
                expected_works: expectedAuthResponse.ok,
                both_work: auth_test.status === 'SUCCESS' && expectedAuthResponse.ok,
                issue_identified: auth_test.status !== 'SUCCESS' && expectedAuthResponse.ok
              }
            };
          } catch (error) {
            diagnostics.expected_credentials_test = {
              status: 'ERROR',
              details: `Error testing expected credentials: ${error.message}`
            };
          }
        }
      } else {
        auth_test = {
          status: 'SKIPPED',
          details: 'Cannot test authentication: missing merchant_id or api_key'
        };
      }

    } catch (error) {
      connectivity_test = {
        status: 'ERROR',
        details: `Connection error: ${error.message}`
      };
      auth_test = {
        status: 'ERROR',
        details: `Authentication test error: ${error.message}`
      };
    }

    diagnostics.connectivity_test = connectivity_test;
    diagnostics.auth_test = auth_test;

    // Overall status
    diagnostics.overall_status = {
      configuration: diagnostics.configuration_status.ready_for_testing ? 'GOOD' : 'ISSUES',
      connectivity: connectivity_test.status === 'REACHABLE' ? 'GOOD' : 'ISSUES',
      authentication: auth_test.status === 'SUCCESS' ? 'GOOD' : 'ISSUES',
      ready_for_production: (
        diagnostics.configuration_status.ready_for_testing && 
        connectivity_test.status === 'REACHABLE' && 
        auth_test.status === 'SUCCESS'
      ) ? 'YES' : 'NO'
    };

    return res.status(200).json(diagnostics);

  } catch (error) {
    return res.status(500).json({
      error: 'Diagnostic test failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}