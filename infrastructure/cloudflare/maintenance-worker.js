export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // This shows the maintenance page if accessing via workers.dev OR your new status subdomain
    if (url.hostname.includes("workers.dev") || url.hostname === "status.linuxdle.site") {
      return maintenancePage();
    }

    try {
      // Normal production routing (Attempt to reach your server)
      const response = await fetch(request);

      // If the tunnel is down or returning a gateway error
      if (response.status === 502 || response.status === 503 || response.status === 504) {
        return maintenancePage();
      }

      return response;
    } catch (e) {
      // Fallback if the Tunnel is COMPLETELY DISCONNECTED
      return maintenancePage();
    }
  }
};

function maintenancePage() {
  const html = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Linuxdle | Maintenance</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500&display=swap');
        
        body { 
          background-color: #0d0d0d; 
          color: #00ff41; 
          font-family: 'Fira Code', 'JetBrains Mono', monospace; 
          display: flex; 
          justify-content: center; 
          align-items: center; 
          height: 100vh; 
          margin: 0;
          overflow: hidden;
        }

        .container { 
          border: 1px solid #00ff41; 
          padding: 30px; 
          max-width: 600px;
          box-shadow: 0 0 20px rgba(0, 255, 65, 0.1);
        }

        .header {
          border-bottom: 1px solid #00ff41;
          padding-bottom: 10px;
          margin-bottom: 20px;
          font-weight: bold;
        }

        .status-line {
          margin: 10px 0;
          display: flex;
          gap: 10px;
        }

        .status-wait { color: #008f11; }
        .status-fail { color: #ff0000; font-weight: bold; }
        .status-info { color: #00ff41; }

        .cursor { 
          display: inline-block;
          width: 10px;
          height: 20px;
          background: #00ff41; 
          margin-left: 5px;
          animation: blink 1s steps(2, start) infinite;
          vertical-align: middle;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .prompt::before {
          content: "$ ";
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">SYSTEM_STATUS: OFFLINE</div>
        
        <div class="status-line prompt">linuxdle --check-connection</div>
        <div class="status-line status-wait">[WAIT] Pinging cloudflared tunnel...</div>
        <div class="status-line status-wait">[WAIT] Routing through Cloudflare Edge...</div>
        <div class="status-line status-fail">[FAIL] ERR_TUNNEL_TIMEOUT: 1033</div>
        
        <br>
        
        <div class="status-line status-info">> Linuxdle is currently down for maintenance.</div>
        <div class="status-line status-info">> Our penguins are currently working on the servers.</div>
        <div class="status-line status-info">> Please try again later.<span class="cursor"></span></div>
      </div>
    </body>
  </html>`;
  
  return new Response(html, {
    headers: { 
      "content-type": "text/html;charset=UTF-8",
      "cache-control": "no-cache"
    },
    status: 503
  });
}
