#!/bin/bash

# Configuration — set these in your environment or .env file:
# CF_ZONE_ID, CF_AUTH_EMAIL, CF_API_TOKEN, CF_RULE_ID, CF_RULESET_ID
ZONE_ID="${CF_ZONE_ID:?CF_ZONE_ID is not set}"
AUTH_EMAIL="${CF_AUTH_EMAIL:?CF_AUTH_EMAIL is not set}"
API_TOKEN="${CF_API_TOKEN:?CF_API_TOKEN is not set}"
RULE_ID="${CF_RULE_ID:?CF_RULE_ID is not set}"
RULESET_ID="${CF_RULESET_ID:?CF_RULESET_ID is not set}"

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
