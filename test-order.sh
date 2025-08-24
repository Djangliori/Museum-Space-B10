#!/bin/bash

echo "Testing UniPay Order Creation..."

# Get auth token
echo "1. Getting auth token..."
AUTH_RESPONSE=$(curl -s -X POST https://apiv2.unipay.com/v3/auth \
  -H "Content-Type: application/json" \
  -d '{"merchant_id":"5015191030581","api_key":"bc6f5073-6d1c-4abe-8456-1bb814077f6e"}')

echo "Auth response: $AUTH_RESPONSE"

# Extract token (basic extraction)
TOKEN=$(echo $AUTH_RESPONSE | grep -o '"auth_token":"[^"]*' | cut -d'"' -f4)
echo "Token: ${TOKEN:0:50}..."

if [ -z "$TOKEN" ]; then
  echo "Failed to get auth token"
  exit 1
fi

# Test order creation
echo "2. Creating test order..."

ORDER_DATA=$(cat << 'EOF'
{
  "MerchantUser": "test.user@museum-space.ge",
  "MerchantOrderID": "TEST-1756044000000",
  "OrderPrice": 10.0,
  "OrderCurrency": "GEL",
  "OrderName": "Test Ticket",
  "OrderDescription": "Museum Test Ticket",
  "SuccessRedirectUrl": "aHR0cHM6Ly9iZXRsZW1pMTAuY29tL3BheW1lbnQtc3VjY2Vzcy5odG1s",
  "CancelRedirectUrl": "aHR0cHM6Ly9iZXRsZW1pMTAuY29tL3BheW1lbnQtY2FuY2VsLmh0bWw=",
  "CallBackUrl": "aHR0cHM6Ly9iZXRsZW1pMTAuY29tL2FwaS91bmlwYXktY2FsbGJhY2s=",
  "Language": "GE"
}
EOF
)

ORDER_RESPONSE=$(curl -s -X POST https://apiv2.unipay.com/v3/api/order/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "$ORDER_DATA" \
  -w "HTTPCODE:%{http_code}")

# Extract HTTP code
HTTP_CODE=$(echo "$ORDER_RESPONSE" | grep -o 'HTTPCODE:[0-9]*' | cut -d: -f2)
RESPONSE_BODY=$(echo "$ORDER_RESPONSE" | sed 's/HTTPCODE:[0-9]*$//')

echo "HTTP Code: $HTTP_CODE"
echo "Response: $RESPONSE_BODY"

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ SUCCESS! Order created"
  # Try to extract checkout URL
  CHECKOUT_URL=$(echo "$RESPONSE_BODY" | grep -o '"Checkout":"[^"]*' | cut -d'"' -f4)
  if [ ! -z "$CHECKOUT_URL" ]; then
    echo "Checkout URL: $CHECKOUT_URL"
  fi
else
  echo "❌ FAILED! HTTP $HTTP_CODE"
  # Pretty print JSON if possible
  echo "$RESPONSE_BODY" | python -m json.tool 2>/dev/null || echo "$RESPONSE_BODY"
fi