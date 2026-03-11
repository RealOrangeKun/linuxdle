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

### Quick Start
1. **Dashboards** → **New** → **New Dashboard**
2. **Add visualization**
3. **Select "Prometheus"** as data source
4. Enter a query from above
5. **Apply**
6. Repeat for other panels

### Recommended 4-Panel Layout (Golden Signals)

**Panel 1: Request Rate (Traffic)**
- Query: `rate(http_server_request_duration_seconds_count{service_name="linuxdle-backend"}[5m])`
- Type: Graph
- Title: "Requests per Second"

**Panel 2: Response Time (Latency)**
- Query: `histogram_quantile(0.95, rate(http_server_request_duration_seconds_bucket{service_name="linuxdle-backend"}[5m]))`
- Type: Graph
- Title: "Response Time (p95)"

**Panel 3: Error Rate (Reliability)**
- Query: `rate(http_server_request_duration_seconds_count{service_name="linuxdle-backend",http_response_status_code=~"5.."}[5m])`
- Type: Graph
- Title: "5xx Errors per Second"

**Panel 4: Memory Usage (Resources)**
- Query: `container_memory_usage_bytes{name="linuxdle-backend"} / 1024 / 1024`
- Type: Graph
- Title: "Backend Memory (MB)"

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
