import pytest
import requests
import time

BASE_URL = "http://localhost:5000/api"
ADMIN_KEY = "admin-fault-injection-secret-key"

ADMIN_HEADERS = {
    "x-api-key": ADMIN_KEY,
    "Content-Type": "application/json"
}

@pytest.fixture(autouse=True)
def reset_faults_after_test():
    yield
    try:
        requests.post(f"{BASE_URL}/fault/reset", headers=ADMIN_HEADERS)
    except Exception:
        pass

@pytest.fixture(scope="session")
def auth_token():
    email = f"user_{int(time.time())}@example.com"
    reg_payload = {
        "full_name": "Test Engineer",
        "email": email,
        "password": "Password123!"
    }
    res = requests.post(f"{BASE_URL}/auth/register", json=reg_payload)
    if res.status_code == 201:
        return res.json().get("token")
    
    login_res = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": "Password123!"})
    if login_res.status_code == 200:
        return login_res.json().get("token")
    return None

def test_health_check():
    res = requests.get("http://localhost:5000/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "HEALTHY"
    assert data["database"]["connected"] is True

def test_user_registration_and_login():
    email = f"auth_test_{int(time.time())}@test.com"
    reg_res = requests.post(f"{BASE_URL}/auth/register", json={
        "full_name": "Auth Test User",
        "email": email,
        "password": "SecurePassword123"
    })
    assert reg_res.status_code == 201
    assert "token" in reg_res.json()

    login_res = requests.post(f"{BASE_URL}/auth/login", json={
        "email": email,
        "password": "SecurePassword123"
    })
    assert login_res.status_code == 200
    assert "token" in login_res.json()

def test_create_and_get_submission(auth_token):
    if not auth_token:
        pytest.skip("Auth token unavailable")

    headers = {"Authorization": f"Bearer {auth_token}"}
    sub_res = requests.post(f"{BASE_URL}/submissions", json={
        "title": "Clean Code Example",
        "description": "Testing function",
        "language": "python",
        "code": "def hello():\n    return 'world'"
    }, headers=headers)

    assert sub_res.status_code == 201
    sub_id = sub_res.json().get("submissionId")
    assert sub_id is not None

    get_res = requests.get(f"{BASE_URL}/submissions/{sub_id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["TITLE"] == "Clean Code Example"

def test_failure_scenario_1_database_disconnect(auth_token):
    inj_res = requests.post(f"{BASE_URL}/fault/inject", json={"type": "db_disconnect", "enabled": True}, headers=ADMIN_HEADERS)
    assert inj_res.status_code == 200

    health_res = requests.get("http://localhost:5000/health")
    assert health_res.status_code == 503
    assert health_res.json()["status"] == "DEGRADED"

    headers = {"Authorization": f"Bearer {auth_token}"} if auth_token else {}
    sub_res = requests.get(f"{BASE_URL}/submissions", headers=headers)
    assert sub_res.status_code == 500

    reset_res = requests.post(f"{BASE_URL}/fault/reset", headers=ADMIN_HEADERS)
    assert reset_res.status_code == 200

    health_after = requests.get("http://localhost:5000/health")
    assert health_after.status_code == 200
    assert health_after.json()["status"] == "HEALTHY"

def test_failure_scenario_2_database_latency(auth_token):
    delay_ms = 1500
    inj_res = requests.post(f"{BASE_URL}/fault/inject", json={"type": "db_latency", "delayMs": delay_ms}, headers=ADMIN_HEADERS)
    assert inj_res.status_code == 200

    headers = {"Authorization": f"Bearer {auth_token}"} if auth_token else {}
    start_time = time.time()
    res = requests.get(f"{BASE_URL}/submissions", headers=headers)
    duration_ms = (time.time() - start_time) * 1000

    assert duration_ms >= 1400

def test_failure_scenario_3_api_error():
    inj_res = requests.post(f"{BASE_URL}/fault/inject", json={
        "type": "api_error",
        "endpoint": "/api/submissions",
        "statusCode": 500,
        "message": "Injected submissions API failure"
    }, headers=ADMIN_HEADERS)
    assert inj_res.status_code == 200

    res = requests.get(f"{BASE_URL}/submissions")
    assert res.status_code == 500
    assert res.json().get("is_fault_injected") is True

def test_failure_scenario_4_service_unhealthy():
    requests.post(f"{BASE_URL}/fault/inject", json={"type": "service_unhealthy", "enabled": True}, headers=ADMIN_HEADERS)
    res = requests.get("http://localhost:5000/health")
    assert res.status_code == 503
