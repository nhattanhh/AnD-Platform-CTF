# 🎮 Attack-Defense CTF Game Workflow

Hướng dẫn hoàn chỉnh về workflow chơi game **Attack-Defense CTF** trên nền tảng **AnD Platform**.

---

## 📋 Mục lục

1. [Tổng quan Attack-Defense CTF](#-tổng-quan-attack-defense-ctf)
2. [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
3. [Workflow chi tiết](#-workflow-chi-tiết)
4. [Hướng dẫn cho Admin](#-hướng-dẫn-cho-admin)
5. [Hướng dẫn cho Team](#-hướng-dẫn-cho-team)
6. [Scoring System](#-scoring-system)
7. [API Reference](#-api-reference-quick)
8. [Troubleshooting](#-troubleshooting)

---

## 🛡️ Tổng quan Attack-Defense CTF

### Attack-Defense CTF là gì?

**Attack-Defense CTF** (Capture The Flag) là một dạng thi đấu CTF mà các đội:

1. **Có hệ thống riêng** - Mỗi đội được cung cấp một server (VulnBox) chứa các services giống nhau
2. **Tấn công đội khác** - Tìm và khai thác lỗ hổng trên VulnBox của đội khác để lấy flags
3. **Bảo vệ hệ thống** - Vá lỗ hổng trên VulnBox của mình để không bị đội khác lấy flags
4. **Duy trì services** - Đảm bảo services hoạt động đúng để không bị trừ điểm SLA

### So sánh với Jeopardy CTF

| Tiêu chí | Jeopardy CTF | Attack-Defense CTF |
|----------|--------------|-------------------|
| Mục tiêu | Giải challenges tĩnh | Tấn công/Phòng thủ real-time |
| Đối thủ | Challenges | Đội khác |
| Flags | Cố định | Thay đổi mỗi tick |
| Thời gian | Linh hoạt | Tick-based (60s) |
| Kỹ năng | Reverse, Web, Crypto... | Exploit dev, Patch, Automation |

---

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────────┐
│                         PLAYERS                                  │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐           │
│   │ Team A  │  │ Team B  │  │ Team C  │  │ Team D  │           │
│   └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘           │
└────────┼────────────┼────────────┼────────────┼─────────────────┘
         │            │            │            │
         ▼            ▼            ▼            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SPRING BOOT BACKEND                           │
│                  (atk-def-backend:8080)                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Authentication │ Team Management │ Proxy APIs           │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PYTHON GAME CORE                              │
│                  (AnD.platform:8000)                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Game Logic │ Flag Generation │ Scoring │ Checker Worker │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────┬───────────────────────────────────┘
                              │
         ┌────────────────────┼───────────────────┐
         │                    │                   │
         ▼                    ▼                   ▼
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│ VulnBox A   │      │ VulnBox B   │      │ VulnBox C   │
│ (Docker)    │      │ (Docker)    │      │ (Docker)    │
│ SSH:10001   │◄────►│ SSH:10002   │◄────►│ SSH:10003   │
│ Service:80  │      │ Service:80  │      │ Service:80  │
└─────────────┘      └─────────────┘      └─────────────┘
```

### Components

| Component | Port | Mô tả |
|-----------|------|-------|
| **Spring Boot Backend** | 8080 | API Gateway, Auth, Team Management |
| **Python Game Core** | 8000 | Game logic, Flag generation, Scoring |
| **PostgreSQL** | 5432 | Database for both services |
| **VulnBox containers** | 10001+ | SSH access for teams |

---

## 📊 Workflow chi tiết

### Game Lifecycle

```
┌──────────┐     ┌───────────┐     ┌─────────┐     ┌──────────┐     ┌──────────┐
│  DRAFT   │ ──► │ DEPLOYING │ ──► │ RUNNING │ ──► │  PAUSED  │ ──► │ FINISHED │
└──────────┘     └───────────┘     └─────────┘     └──────────┘     └──────────┘
     │                                   │              │
     │                                   │              │
     ▼                                   ▼              ▼
 [Setup]                            [Gameplay]      [Resume]
 - Upload VulnBox                   - Ticks run     - Continue
 - Upload Checker                   - Flags gen     - Or Stop
 - Add Teams                        - SLA check
                                    - Scoring
```

### Tick Workflow (Mỗi 60 giây)

```
TICK #N START
     │
     ├──► 1. Generate new flags for each team
     │         └─► Flag = HMAC(game_id, team_id, tick_number, secret)
     │
     ├──► 2. Run Checker on all VulnBoxes
     │         ├─► UP (100 SLA points)
     │         ├─► DOWN (0 SLA points, service broken)
     │         └─► ERROR (50 SLA points, partial)
     │
     ├──► 3. Process flag submissions
     │         ├─► ACCEPTED (+attack_points, -victim_defense)
     │         ├─► REJECTED (invalid flag)
     │         ├─► DUPLICATE (already submitted)
     │         └─► OWN_FLAG (can't submit your own)
     │
     ├──► 4. Calculate scores
     │         └─► Total = Attack + Defense + SLA
     │
     └──► 5. Update scoreboard
```

---

## 👑 Hướng dẫn cho Admin

### Phase 1: Setup Game

#### 1.1 Tạo Game mới

```bash
# Login as Admin
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.token')

# Create new game
curl -X POST http://localhost:8080/api/proxy/games \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CTF Championship 2024",
    "description": "Annual CTF competition",
    "tick_duration_seconds": 60,
    "max_ticks": 100
  }'
```

#### 1.2 Upload VulnBox

VulnBox là Docker image chứa các vulnerable services. Upload qua API proxy:

```bash
# Upload VulnBox docker image
curl -X POST http://localhost:8080/api/proxy/vulnboxes \
  -H "Authorization: Bearer $TOKEN" \
  -F "name=web_service_vulnbox" \
  -F "docker_image=@/path/to/vulnbox.tar"

# Response:
# {
#   "id": "vulnbox-uuid-123",
#   "name": "web_service_vulnbox",
#   "file_path": "uploads/vulnboxes/xxx_vulnbox.tar",
#   "created_at": "2024-01-05T10:00:00"
# }

# Assign VulnBox to Game
VULNBOX_ID="vulnbox-uuid-123"
curl -X POST "http://localhost:8080/api/proxy/games/{game_id}/assign-vulnbox?vulnbox_id=$VULNBOX_ID" \
  -H "Authorization: Bearer $TOKEN"
```

#### 1.3 Upload Checker

Checker là Python script kiểm tra service có hoạt động đúng không:

```bash
# Upload checker script
curl -X POST http://localhost:8080/api/proxy/checkers \
  -H "Authorization: Bearer $TOKEN" \
  -F "name=web_service_checker" \
  -F "file=@/path/to/checker.py"

# Response:
# {
#   "id": "checker-uuid-456",
#   "name": "web_service_checker",
#   "file_path": "uploads/checkers/xxx_checker.py",
#   "module_name": "uploads.checkers.xxx_checker",
#   "created_at": "2024-01-05T10:00:00"
# }

# Assign Checker to Game
CHECKER_ID="checker-uuid-456"
curl -X POST "http://localhost:8080/api/proxy/games/{game_id}/assign-checker?checker_id=$CHECKER_ID" \
  -H "Authorization: Bearer $TOKEN"
```

**Checker Script Example:**

```python
#!/usr/bin/env python3
"""
Checker script for web service
Must implement check() function
"""

def check(host: str, port: int) -> dict:
    """
    Check if service is working correctly
    
    Returns:
        {
            "status": "UP" | "DOWN" | "ERROR",
            "message": "Service is running",
            "latency_ms": 123
        }
    """
    import requests
    try:
        response = requests.get(f"http://{host}:{port}/health", timeout=5)
        if response.status_code == 200:
            return {
                "status": "UP",
                "message": "Service is running",
                "latency_ms": int(response.elapsed.total_seconds() * 1000)
            }
        else:
            return {
                "status": "ERROR",
                "message": f"Unexpected status code: {response.status_code}"
            }
    except Exception as e:
        return {
            "status": "DOWN",
            "message": f"Connection failed: {str(e)}"
        }
```

#### 1.4 Add Teams

```bash
# Add team to game
curl -X POST http://localhost:8080/api/proxy/games/{game_id}/teams \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"team_id": "team1"}'
```

### Phase 2: Start Game

```bash
# Start the game - this will:
# 1. Build VulnBox Docker image
# 2. Deploy container for each team
# 3. Generate SSH credentials
# 4. Start tick worker

curl -X POST http://localhost:8080/api/proxy/games/{game_id}/start \
  -H "Authorization: Bearer $TOKEN"

# Response will contain SSH credentials for each team:
# {
#   "message": "Game started",
#   "teams": [
#     {
#       "team_id": "team1",
#       "ssh_host": "game.server.com",
#       "ssh_port": 10001,
#       "ssh_username": "ctf_user_abc123",
#       "ssh_password": "random_password"
#     }
#   ]
# }
```

### Phase 3: Monitor Game

```bash
# View scoreboard
curl http://localhost:8080/api/proxy/scoreboard/{game_id}

# View current tick
curl http://localhost:8080/api/proxy/ticks/current?gameId={game_id}

# View flag statistics
curl http://localhost:8080/api/proxy/flags/stats?gameId={game_id} \
  -H "Authorization: Bearer $TOKEN"

# View service statuses (checker results)
curl http://localhost:8080/api/proxy/checker/statuses?gameId={game_id} \
  -H "Authorization: Bearer $TOKEN"
```

### Phase 4: Game Control

```bash
# Pause game (emergency)
curl -X POST http://localhost:8080/api/proxy/games/{game_id}/pause \
  -H "Authorization: Bearer $TOKEN"

# Resume game
curl -X POST http://localhost:8080/api/proxy/games/{game_id}/start \
  -H "Authorization: Bearer $TOKEN"

# Stop game (end competition)
curl -X POST http://localhost:8080/api/proxy/games/{game_id}/stop \
  -H "Authorization: Bearer $TOKEN"
```

---

## 👥 Hướng dẫn cho Team

### Setup

#### 1. Đăng ký tài khoản

```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "myteam",
    "password": "secure_password",
    "teamName": "Super Hackers"
  }'
```

#### 2. Login

```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"username":"myteam","password":"secure_password"}' | jq -r '.token')
```

### Khi game bắt đầu

#### 1. Nhận SSH credentials từ Admin

```
SSH Host: game.server.com
SSH Port: 10001
Username: ctf_user_abc123
Password: random_password
```

#### 2. Truy cập VulnBox

```bash
ssh -p 10001 ctf_user_abc123@game.server.com
```

### Gameplay Loop

```
┌──────────────────────────────────────────────────────────────────┐
│                    TEAM GAMEPLAY LOOP                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│   1. 🔍 RECONNAISSANCE                                          │
│      ├─ Phân tích services trên VulnBox của mình                │
│      ├─ Tìm lỗ hổng trong source code                           │
│      └─ Xác định flag location                                  │
│                                                                  │
│   2. ⚔️ ATTACK                                                   │
│      ├─ Viết exploit cho lỗ hổng                                │
│      ├─ Scan và khai thác VulnBox đội khác                      │
│      ├─ Lấy flags từ đội bị exploit                             │
│      └─ Submit flags ngay lập tức (trước khi expire)            │
│                                                                  │
│   3. 🛡️ DEFENSE                                                  │
│      ├─ Patch lỗ hổng trên VulnBox của mình                     │
│      ├─ Không làm hỏng service (sẽ mất điểm SLA)                │
│      └─ Monitor logs để phát hiện attacks                       │
│                                                                  │
│   4. 🤖 AUTOMATION                                               │
│      ├─ Viết script tự động exploit tất cả đội                  │
│      ├─ Tự động submit flags                                    │
│      └─ Loop mỗi tick                                           │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Submit Flags

```bash
# Submit a captured flag
curl -X POST http://localhost:8080/api/proxy/submissions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "game_id": "game-uuid",
    "team_id": "myteam",
    "flag": "FLAG{captured_from_victim}"
  }'

# Response:
# {"status": "ACCEPTED", "points": 100, "message": "Flag accepted!"}
# {"status": "REJECTED", "points": 0, "message": "Invalid flag"}
# {"status": "DUPLICATE", "points": 0, "message": "Already submitted"}
# {"status": "OWN_FLAG", "points": 0, "message": "Cannot submit own flag"}
```

### Automation Script Example

```python
#!/usr/bin/env python3
"""
Automated exploit and submit script
Run this every tick to maximize points
"""

import requests
import subprocess

# Config
API_URL = "http://localhost:8080"
TOKEN = "your_jwt_token"
GAME_ID = "game-uuid"
TEAM_ID = "myteam"

# Target IPs (other teams' VulnBoxes)
TARGETS = [
    "10.0.0.2",  # Team B
    "10.0.0.3",  # Team C
    "10.0.0.4",  # Team D
]

def exploit_target(target_ip):
    """Run exploit against target and return flag"""
    try:
        # Example: SQL injection to read flag
        result = subprocess.run(
            ["./exploit.sh", target_ip],
            capture_output=True,
            timeout=10
        )
        output = result.stdout.decode()
        # Extract flag from output
        if "FLAG{" in output:
            start = output.index("FLAG{")
            end = output.index("}", start) + 1
            return output[start:end]
    except Exception as e:
        print(f"Error exploiting {target_ip}: {e}")
    return None

def submit_flag(flag):
    """Submit flag to game server"""
    response = requests.post(
        f"{API_URL}/api/proxy/submissions",
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Content-Type": "application/json"
        },
        json={
            "game_id": GAME_ID,
            "team_id": TEAM_ID,
            "flag": flag
        }
    )
    return response.json()

if __name__ == "__main__":
    print("Starting exploit loop...")
    for target in TARGETS:
        flag = exploit_target(target)
        if flag:
            result = submit_flag(flag)
            print(f"[{target}] {flag[:20]}... -> {result['status']}")
```

### Check Scoreboard

```bash
# View live scoreboard (no auth needed)
curl http://localhost:8080/api/proxy/scoreboard/{game_id}

# View your submissions
curl http://localhost:8080/api/proxy/submissions?gameId={game_id} \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🏆 Scoring System

### Điểm được tính như sau:

```
TOTAL_SCORE = ATTACK_POINTS + DEFENSE_POINTS + SLA_POINTS
```

### Attack Points (Tấn công)

| Action | Points |
|--------|--------|
| Submit valid flag từ đội khác | +100 |
| Submit flag của chính mình | 0 (rejected) |
| Submit duplicate flag | 0 (rejected) |
| Submit expired flag | 0 (rejected) |

### Defense Points (Phòng thủ)

| Situation | Points |
|-----------|--------|
| Không bị đội nào lấy flag | +100 / tick |
| Bị 1 đội lấy flag | +50 / tick |
| Bị nhiều đội lấy flag | -50 / tick |

### SLA Points (Service Level Agreement)

| Status | Points | Mô tả |
|--------|--------|-------|
| UP | +100 / tick | Service hoạt động đúng |
| DOWN | 0 | Service không phản hồi |
| ERROR | +50 / tick | Service phản hồi nhưng không đúng |

### Scoreboard Example

```
┌──────┬───────────────┬────────┬─────────┬─────┬───────┬──────┐
│ Rank │ Team          │ Attack │ Defense │ SLA │ Total │ Δ    │
├──────┼───────────────┼────────┼─────────┼─────┼───────┼──────┤
│  1   │ Super Hackers │  2400  │  1800   │ 900 │ 5100  │ +300 │
│  2   │ Code Ninjas   │  2100  │  2000   │ 850 │ 4950  │ +150 │
│  3   │ Byte Force    │  1800  │  2200   │ 900 │ 4900  │ -50  │
│  4   │ Cyber Lions   │  1500  │  1500   │ 700 │ 3700  │ +200 │
└──────┴───────────────┴────────┴─────────┴─────┴───────┴──────┘
```

---

## 🔌 API Reference (Quick)

### Public APIs (Không cần auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/proxy/scoreboard` | List all scoreboards |
| GET | `/api/proxy/scoreboard/{gameId}` | Scoreboard of game |
| GET | `/api/proxy/ticks/current?gameId=xxx` | Current tick |
| GET | `/api/proxy/ticks/latest?gameId=xxx` | Latest tick |
| GET | `/api/teams` | List all teams |

### Team APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register team |
| POST | `/api/auth/signin` | Login |
| POST | `/api/proxy/submissions` | Submit flag |
| GET | `/api/proxy/submissions` | View my submissions |

### Admin APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/proxy/games` | Create game |
| POST | `/api/proxy/checkers` | Upload checker script |
| POST | `/api/proxy/vulnboxes` | Upload vulnbox docker image |
| POST | `/api/proxy/games/{id}/assign-checker` | Assign checker to game |
| POST | `/api/proxy/games/{id}/assign-vulnbox` | Assign vulnbox to game |
| POST | `/api/proxy/games/{id}/start` | Start game |
| POST | `/api/proxy/games/{id}/stop` | Stop game |
| GET | `/api/proxy/flags` | View all flags |
| GET | `/api/proxy/checker/statuses` | View SLA checks |

### Swagger UI

Truy cập Swagger UI để test APIs interactively:

```
http://localhost:8080/swagger-ui.html
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. "Flag rejected - Invalid flag"

- Flag đã expire (tick cũ)
- Sai format flag
- Flag từ game khác

**Solution**: Đảm bảo submit flag ngay sau khi capture

#### 2. "Service DOWN - SLA check failed"

- Service crashed sau khi patch
- Patch làm thay đổi response format
- Container bị restart

**Solution**: Test kỹ trước khi patch, đảm bảo service vẫn hoạt động đúng

#### 3. "Cannot connect to VulnBox"

- SSH credentials sai
- Container chưa start
- Network issue

**Solution**: Liên hệ Admin để kiểm tra container status

#### 4. "Scoreboard not updating"

- Game đang paused
- Tick worker gặp lỗi
- Database connection issue

**Solution**: Kiểm tra game status và liên hệ Admin

---

## 📚 Resources

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI Spec**: http://localhost:8080/v3/api-docs
- **Python Core Health**: http://localhost:8000/health
- **Documentation**: [PROXY-API-REFERENCE.md](./PROXY-API-REFERENCE.md)

---

## 📝 Checklist

### Admin Checklist

- [ ] Create game với settings đúng
- [ ] Upload VulnBox qua `/api/proxy/vulnboxes`
- [ ] Upload Checker qua `/api/proxy/checkers`
- [ ] Assign VulnBox và Checker cho game
- [ ] Add tất cả teams vào game
- [ ] Test checker hoạt động (validate endpoint)
- [ ] Start game
- [ ] Gửi SSH credentials cho teams
- [ ] Monitor scoreboard
- [ ] Handle issues kịp thời

### Team Checklist

- [ ] Register và login
- [ ] Nhận SSH credentials
- [ ] Connect vào VulnBox
- [ ] Phân tích services
- [ ] Tìm vulnerabilities
- [ ] Viết exploits
- [ ] Patch vulnerabilities
- [ ] Automate exploit/submit
- [ ] Monitor scoreboard
- [ ] Maintain SLA

---

*Last updated: 2024-01-04*
*Version: 1.0.0*
