# Linuxdle Monitoring Guide

## Access Grafana
- URL: http://localhost:3000
- Login: `admin` / `admin`

---

## Container Health Metrics (Prometheus)

Navigate to: **Explore → Select "Prometheus"**

### CPU Usage by Container
Shows CPU usage % for each container
```promql
rate(container_cpu_usage_seconds_total{name=~"linuxdle-.*"}[5m]) * 100
```

### Memory Usage
Shows memory in MB per container
```promql
container_memory_usage_bytes{name=~"linuxdle-.*"} / 1024 / 1024
```

### Request Rate (Backend Traffic)
Requests per second to your backend
```promql
rate(http_server_request_duration_seconds_count{service_name="linuxdle-backend"}[5m])
```

### Request Duration (95th Percentile)
How long most requests take (latency)
```promql
histogram_quantile(0.95, rate(http_server_request_duration_seconds_bucket{service_name="linuxdle-backend"}[5m]))
```

### Error Rate
5xx errors per second
```promql
rate(http_server_request_duration_seconds_count{service_name="linuxdle-backend",http_response_status_code=~"5.."}[5m])
```

### Active Database Connections
How busy your backend is
```promql
process_runtime_dotnet_thread_pool_queue_length{service_name="linuxdle-backend"}
```

### Container Network Traffic (Received)
Network bytes received per container
```promql
rate(container_network_receive_bytes_total{name=~"linuxdle-.*"}[5m])
```

### Container Network Traffic (Sent)
Network bytes sent per container
```promql
rate(container_network_transmit_bytes_total{name=~"linuxdle-.*"}[5m])
```

---

## Application Logs (Loki)

Navigate to: **Explore → Select "Loki"**

### View All App Logs
```logql
{service_name="linuxdle-backend"}
```

### Only Errors
```logql
{service_name="linuxdle-backend"} |= "error"
```

### Only Warnings
```logql
{service_name="linuxdle-backend"} |= "warn"
```

### Search for Specific Endpoint
```logql
{service_name="linuxdle-backend"} |= "/api/daily-commands"
```

### Log Rate (Logs per Second)
```logql
rate({service_name="linuxdle-backend"}[1m])
```

### Filter by Log Level (Structured)
```logql
{service_name="linuxdle-backend"} | json | level="Information"
```

### Search for Exceptions
```logql
{service_name="linuxdle-backend"} |= "Exception"
```

---

## Health Indicators

### ✅ Good Health
- CPU usage < 70%
- Memory usage steady (not climbing)
- Response time (p95) < 500ms
- Error rate near 0
- No exceptions in logs

### ⚠️ Warning Signs
- Memory usage increasing over time = potential memory leak
- CPU spikes without traffic increase = inefficient code
- Response time > 1s = slow database queries or cache misses
- Occasional errors = review logs for patterns

### 🚨 Critical Issues
- CPU > 90% sustained = service degradation
- Memory > 90% = imminent crashes
- Error rate increasing = bugs or dependency failures
- No logs = application not running or logging not configured

---

## Creating a Dashboard

### Exact Steps to Create Your First Dashboard

1. **Click "Dashboards"** in the left sidebar (icon looks like 4 squares)
2. **Click the blue "New" button** (top right)
3. **Click "New Dashboard"** from the dropdown
4. **Click the blue "+ Add visualization" button**
5. **Click "Prometheus"** from the data source list

#### First Panel - Request Rate

6. In the query box at the bottom, **paste this**:
   ```
   rate(http_server_request_duration_seconds_count{service_name="linuxdle-backend"}[5m])
   ```
7. **Click in the "Panel title" field** (top left, says "Panel Title")
8. **Type**: `Requests per Second`
9. **Click the blue "Apply" button** (top right corner)

#### Second Panel - Response Time

10. **Click "+ Add" dropdown** (top right) → **Click "Visualization"**
11. **Click "Prometheus"** again
12. **Paste this query**:
    ```
    histogram_quantile(0.95, rate(http_server_request_duration_seconds_bucket{service_name="linuxdle-backend"}[5m]))
    ```
13. **Change title to**: `Response Time (p95)`
14. **Click "Apply"**

#### Third Panel - Error Rate

15. **Click "+ Add" → "Visualization"**
16. **Click "Prometheus"**
17. **Paste this query**:
    ```
    rate(http_server_request_duration_seconds_count{service_name="linuxdle-backend",http_response_status_code=~"5.."}[5m])
    ```
18. **Change title to**: `5xx Errors per Second`
19. **Click "Apply"**

#### Fourth Panel - Memory Usage

20. **Click "+ Add" → "Visualization"**
21. **Click "Prometheus"**
22. **Paste this query**:
    ```
    container_memory_usage_bytes{name="linuxdle-backend"} / 1024 / 1024
    ```
23. **Change title to**: `Backend Memory (MB)`
24. **Click "Apply"**

#### Save Your Dashboard

25. **Click the save icon** (disk/floppy icon, top right)
26. **Type a name**: `Linuxdle Monitoring`
27. **Click "Save"**

Done! You now have a 4-panel monitoring dashboard.

---

## Common Troubleshooting Scenarios

### High Response Times
1. Check database query duration in logs
2. Verify Redis cache is working: `{service_name="linuxdle-backend"} |= "cache"`
3. Look for slow endpoints: `{service_name="linuxdle-backend"} |= "Executed DbCommand"`

### Memory Leaks
1. Monitor memory over 24 hours
2. If steadily climbing, check for unclosed connections
3. Review cache size: `{service_name="linuxdle-backend"} |= "Cache"`

### Errors After Deployment
1. Check recent logs: `{service_name="linuxdle-backend"} | json | level="Error"`
2. Verify environment variables in container
3. Check database connectivity

### No Data in Grafana
1. Verify containers are running: `docker ps`
2. Check Prometheus targets: http://localhost:9090/targets
3. Verify Loki is receiving logs: http://localhost:3100/ready

---

## Useful Prometheus Targets

- **Prometheus UI**: http://localhost:9090
- **Prometheus Targets Status**: http://localhost:9090/targets
- **Backend Metrics Endpoint**: http://localhost:5000/metrics
- **cAdvisor Metrics**: http://localhost:8080/metrics (if exposed)

## Useful Loki Endpoints

- **Loki Health**: http://localhost:3100/ready
- **Loki Metrics**: http://localhost:3100/metrics

---

## Tips

- Set time range to "Last 15 minutes" for recent data
- Use "Auto refresh" (top right) for live monitoring
- Create alerts by adding alert rules to dashboard panels
- Export dashboards as JSON for backup or sharing
- Use variables in dashboards for dynamic filtering (e.g., `$container`)

---

## Next Steps

1. Explore the queries above in Grafana Explore
2. Create your first dashboard with the 4-panel layout
3. Set up alerts for critical metrics (optional)
4. Review logs daily to understand application behavior
5. Monitor during deployments to catch issues early
