import subprocess
import json
import re
import ipaddress
from flask import current_app
from main import socketio
from main.models import db, RemoteIP
from datetime import datetime

connection_timestamps = {}


def get_tcp_connections():
    try:
        result = subprocess.run(
            ["ss", "-tunap"],
            capture_output=True,
            text=True
        )

        if result.returncode != 0:
            return None, result.stderr

        lines = result.stdout.splitlines()
        connections = []

        for line in lines[1:]:
            parts = line.split()
            if len(parts) < 6:
                continue

            local = parts[4]
            remote = parts[5]

            try:
                local_addr, local_port = local.rsplit(":", 1)
                remote_addr, remote_port = remote.rsplit(":", 1)
            except ValueError:
                continue

            if remote_addr in ("127.0.0.1", "::1", "0.0.0.0", "*"):
                continue

            if local_port == "1337" or remote_port == "*":
                continue

            pid_only = "N/A"
            if len(parts) > 6:
                raw_process = parts[-1] 
                match = re.search(r"pid=(\d+)", raw_process)
                if match:
                    pid_only = match.group(1)

            connections.append({
                "LocalAddress": local_addr,
                "LocalPort": local_port,
                "RemoteAddress": remote_addr,
                "RemotePort": remote_port,
                "State": parts[0],
                "OwningProcess": pid_only
            })

        return connections, None

    except Exception as e:
        return None, str(e)


def monitor_tcp_connections():
    while True:
        try:
            data, error = get_tcp_connections()

            if error:
                socketio.emit("tcp_data", {"success": False, "error": error})
                socketio.sleep(2)
                continue

            now = datetime.now()
            current_time = (
                now.strftime("%Y-%m-%d %I:%M:%S")
                + f":{int(now.microsecond / 1000):03d}"
            )

            for conn in data:
                key = (
                    conn["LocalAddress"],
                    conn["LocalPort"],
                    conn["RemoteAddress"],
                    conn["RemotePort"],
                    conn["OwningProcess"],
                )

                if key not in connection_timestamps:
                    connection_timestamps[key] = current_time

                conn["FirstSeen"] = connection_timestamps[key]

            socketio.emit("tcp_data", {"success": True, "connections": data})

        except Exception as e:
            socketio.emit("tcp_data", {"success": False, "error": str(e)})

        socketio.sleep(2)


@socketio.on("get_tcp_connections")
def handle_get_tcp_connections():
    print("[TCP Monitor] Client connected")
    socketio.emit("client_info")


@socketio.on("save_remote_ips")
def handle_save_remote_ips(ip_list):
    with current_app.app_context():
        try:
            for ip in ip_list:

                if ip in ("127.0.0.1", "::1"):
                    continue

                try:
                    ipaddress.ip_address(ip)
                except ValueError:
                    print(f"[INVALID IP] Skipping: {ip}")
                    continue

                exists = db.session.query(RemoteIP).filter_by(ip_address=ip).first()

                if not exists:
                    db.session.add(RemoteIP(ip_address=ip))

            db.session.commit()

        except Exception as e:
            print(f"[DB ERROR] Failed to save remote IPs: {e}")