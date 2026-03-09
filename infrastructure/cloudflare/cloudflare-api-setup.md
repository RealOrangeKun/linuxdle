# Cloudflare API Setup for Maintenance Toggle

Follow these steps to get the IDs you need for `maintenance-mode.sh`.

### 1. Zone ID
You can find this on the right-hand sidebar of your `linuxdle.site` summary page in the Cloudflare Dashboard.

### 2. API Token
1. Go to **My Profile** -> **API Tokens**.
2. Click **Create Token**.
3. Use the **Custom Token** template.
4. **Permissions:**
   - **Account** -> **Workers Scripts** -> **Edit**
   - **Zone** -> **Redirect Rules** -> **Edit**
   - **Zone** -> **Zone Settings** -> **Read**
5. **Zone Resources:** Include your `linuxdle.site`.

### 3. Rule ID
You can get the `RULE_ID` for your `Maintenance Mode` rule by running this command in your terminal:

```bash
curl -X GET "https://api.cloudflare.com/client/v4/zones/YOUR_ZONE_ID/rulesets/phases/http_request_dynamic_redirect/entrypoint" \
     -H "X-Auth-Email: YOUR_EMAIL" \
     -H "Authorization: Bearer YOUR_API_TOKEN" \
     -H "Content-Type: application/json"
```

Look for the `id` field inside the `rules` array that matches your `Maintenance Mode` rule's name.

### 4. Updating the Script
Once you have the IDs, edit `maintenance-mode.sh` and replace the placeholder values:
```bash
ZONE_ID="your_zone_id_here"
AUTH_EMAIL="your_email_here"
API_TOKEN="your_api_token_here"
RULE_ID="your_rule_id_here"
```

### 5. Running the Script
1.  Make the script executable: `chmod +x infrastructure/cloudflare/maintenance-mode.sh`
2.  Toggle maintenance mode: 
    - `./infrastructure/cloudflare/maintenance-mode.sh on`
    - `./infrastructure/cloudflare/maintenance-mode.sh off`
