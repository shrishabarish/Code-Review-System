# Code Review System — Cloud & Fault-Injectable Architecture for RCA Platform

A production-ready, cloud-native evolution of the SQL-based Code Review System. Designed to serve as a **live target application for Root Cause Analysis (RCA) platforms**, producing genuine runtime logs, correlation IDs, metric surges, and reversible failure symptoms.

---

## 🌟 Key Architecture Highlights

1. **Dual Relational Database Engine**: Native support for **PostgreSQL on AWS RDS** (and local Docker) with backward compatibility for Oracle Database.
2. **Centralized Failure Injection Layer**: Controllable via `/api/fault/*` with 5 reversible incident scenarios (Database Drop, Latency Spike, API 500, Dependency Timeout, Service Crash).
3. **Structured Observability**: Structured JSON logs emitted to `stdout` for AWS CloudWatch and RCA ingestion with Correlation IDs (`X-Request-ID`, `X-Correlation-ID`).
4. **Single-Command Docker Deployment**: Complete multi-container environment with auto-initialized database schemas, procedures, and triggers.
5. **Infrastructure as Code**: Modular Terraform configuration for AWS VPC, RDS PostgreSQL, ECS Fargate, IAM, and CloudWatch.

---

## 🚀 Quick Start (Local Docker)

```bash
# 1. Navigate to the project
cd "AWS failure"

# 2. Build and start all services (Frontend, Backend, PostgreSQL, MongoDB)
docker compose up --build -d

# 3. Check health
curl http://localhost:5000/health
```

* **Frontend UI**: [http://localhost:3000](http://localhost:3000)
* **Backend API**: [http://localhost:5000](http://localhost:5000)
* **Health Endpoint**: [http://localhost:5000/health](http://localhost:5000/health)

---

## 🧪 Running Automated Tests

```bash
pip install pytest requests
pytest test_full_system.py -v
```

---

## 💉 Failure Injection & RCA Incident Matrix

All failure modes are controlled, isolated, reversible, and disabled by default.

| Scenario | Trigger Command (Admin API) | Observable Symptoms | Expected Root Cause | Recovery Command |
| :--- | :--- | :--- | :--- | :--- |
| **1. Database Outage** | `POST /api/fault/inject` `{"type": "db_disconnect", "enabled": true}` | DB connection refused, HTTP 500 responses, `/health` returns 503 | Database connectivity failure | `POST /api/fault/reset` |
| **2. DB Latency Spike** | `POST /api/fault/inject` `{"type": "db_latency", "delayMs": 4000}` | API response times jump to >4s, P99 latency alarms trigger | Slow database query execution | `POST /api/fault/reset` |
| **3. API Error (HTTP 500)** | `POST /api/fault/inject` `{"type": "api_error", "endpoint": "/api/submissions"}` | Target route returns HTTP 500 with `SimulatedApiFault` | Injected application endpoint failure | `POST /api/fault/reset` |
| **4. Dependency Timeout** | `POST /api/fault/inject` `{"type": "dependency_timeout", "delayMs": 8000}` | Review consensus calculation times out | Downstream dependency latency | `POST /api/fault/reset` |
| **5. Service Crash** | `POST /api/fault/crash` | Process exits with code 1; Docker/ECS automatically restarts | Process termination | Auto-restarts healthy |

---

## ☁️ AWS Deployment with Terraform

```bash
cd terraform
terraform init
terraform plan -var="db_password=YourSecurePassword123!"
terraform apply -var="db_password=YourSecurePassword123!" -auto-approve
```

---

## 📜 Causal Chain for RCA Platform

```
[Injected Database Disconnect]
               │
               ▼ (Root Cause Event)
   DATABASE_CONNECTION_ERROR (level: ERROR, module: DATABASE)
               │
               ▼ (Downstream Symptom)
   HTTP_REQUEST_COMPLETED (status: 500, module: HTTP)
               │
               ▼ (Health Degradation)
   HEALTH_CHECK_FAILED (status: 503, service: DEGRADED)
```
