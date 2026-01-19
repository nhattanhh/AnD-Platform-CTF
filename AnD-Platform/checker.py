"""
Test Vulnbox Checker

Checks the vulnerable test service running on port 5000.
The service responds to: PING, STATUS, GETFLAG commands.

The checker verifies:
1. Service is reachable on port 5000
2. PING command returns PONG
3. STATUS command returns SERVICE: OK
"""

import socket
from typing import Any


def check(team_ip: str, game_id: str, team_id: str, tick_number: int) -> dict[str, Any]:
    """
    Check the test vulnbox service.
    
    Args:
        team_ip: IP address of team's vulnbox container
        game_id: UUID of the game
        team_id: Team identifier
        tick_number: Current tick number
    
    Returns:
        dict with status, sla percentage, and optional message
    """
    try:
        # Connect to the service on port 5000
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)
        sock.connect((team_ip, 5000))
        
        # Receive welcome message
        welcome = sock.recv(1024).decode()
        if "Welcome to the Test Service" not in welcome:
            sock.close()
            return {
                "status": "down",
                "sla": 0.0,
                "message": "Invalid welcome message",
            }
        
        # Test PING command
        sock.send(b"PING\n")
        response = sock.recv(1024).decode()
        if "PONG" not in response:
            sock.close()
            return {
                "status": "down",
                "sla": 50.0,
                "message": "PING command failed",
            }
        
        # Test STATUS command
        sock.send(b"STATUS\n")
        response = sock.recv(1024).decode()
        if "SERVICE: OK" not in response:
            sock.close()
            return {
                "status": "down",
                "sla": 75.0,
                "message": "STATUS command failed",
            }
        
        # Clean disconnect
        sock.send(b"QUIT\n")
        sock.close()
        
        return {
            "status": "up",
            "sla": 100.0,
            "message": None,
        }
    
    except socket.timeout:
        return {
            "status": "down",
            "sla": 0.0,
            "message": "Connection timeout",
        }
    
    except ConnectionRefusedError:
        return {
            "status": "down",
            "sla": 0.0,
            "message": "Connection refused - service not running",
        }
    
    except Exception as e:
        return {
            "status": "error",
            "sla": 0.0,
            "message": str(e),
        }
