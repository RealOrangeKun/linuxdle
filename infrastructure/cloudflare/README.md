# Cloudflare Maintenance Worker

This worker replaces the default Cloudflare 1033 error (Tunnel Disconnected) with a terminal-themed maintenance page.

## How to Deploy
1.  Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2.  Navigate to **Compute (Workers & Pages)** -> **Create** -> **Create Worker**.
3.  Name it `linuxdle-maintenance-guard`.
4.  Copy the contents of `maintenance-worker.js` and paste them into the worker editor.
5.  Click **Save and Deploy**.

## How to Activate
1.  Go to **Websites** -> `linuxdle.site`.
2.  Select **Workers Routes** on the left.
3.  Add two routes (both pointing to this worker):
    - `linuxdle.site/*`
    - `www.linuxdle.site/*`

## How to Test
You can always view how the maintenance page looks by visiting your worker's `.workers.dev` URL. The code detects this URL and shows the maintenance page immediately for easy testing.
