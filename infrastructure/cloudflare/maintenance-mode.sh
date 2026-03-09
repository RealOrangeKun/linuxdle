#!/bin/bash

# Configuration
ZONE_ID="68b8593a494353ec7fc0e21691d8d0fa"
AUTH_EMAIL="yousseftarekali04@gmail.com"
API_TOKEN="8rpNIN6hNCnI-zYrsIu1QNFwPa1gaJJM7lw8W_Ce"
RULE_ID="e9c72d398a5d4679a99636f55e92344a"
RULESET_ID="c3cad28aab954861810f3a42645e08b3"

# Usage check
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 {on|off}"
    exit 1
fi

ACTION=$1

if [ "$ACTION" == "on" ]; then
    ENABLED=true
elif [ "$ACTION" == "off" ]; then
    ENABLED=false
else
    echo "Invalid action: $ACTION. Use 'on' or 'off'."
    exit 1
fi

# Toggle the rule via Cloudflare API
# Note: Cloudflare requires FULL rule definition for updates on some endpoints
RESPONSE=$(curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/rulesets/$RULESET_ID/rules/$RULE_ID" \
     -H "X-Auth-Email: $AUTH_EMAIL" \
     -H "Authorization: Bearer $API_TOKEN" \
     -H "Content-Type: application/json" \
     --data "{
       \"enabled\": $ENABLED,
       \"action\": \"redirect\",
       \"action_parameters\": {
         \"from_value\": {
           \"status_code\": 302,
           \"target_url\": {
             \"expression\": \"concat(\\\"https://status.linuxdle.site\\\", http.request.uri.path)\"
           },
           \"preserve_query_string\": false
         }
       },
       \"expression\": \"(http.host ne \\\"status.linuxdle.site\\\")\",
       \"description\": \"Maintenance Mode\"
     }")

if echo "$RESPONSE" | grep -q '"success": *true'; then
    echo "[OK] Maintenance Mode is now $ACTION."
else
    echo "[FAIL] Could not toggle Maintenance Mode."
    echo "Full response: $RESPONSE"
    exit 1
fi
