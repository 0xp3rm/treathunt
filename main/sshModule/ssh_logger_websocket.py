# MODULE FOR HANDLING SSH MONITORING OF LOGS AND DETECTION (LINUX VERSION)

from main.modules.sshModule.convertTimestamp import convert_timestamp
from main import socketio
from main.models import db, SSHLog
import subprocess
import threading
import time
import re
import traceback
from collections import Counter
from flask import request

log_thread_started = False
last_seen_line = ""
clients_sent_full_history = set()
last_processed_time = None


def fetch_failed_ssh_logs(max_events=1000):
    try:
        with open("/var/log/auth.log", "r") as f:
            lines = f.readlines()

        logs = []
        for line in lines[-max_events:]:
            line = line.strip()
            if "Failed password" in line:
                timestamp_match = re.search(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}", line)
                
                if timestamp_match:
                    raw_ts = timestamp_match.group(0)
                else:
                    raw_ts = line[:15]

                logs.append({
                    "TimeCreated": raw_ts, 
                    "Message": line,
                })
        return logs
    except Exception as e:
        print(f"[Log Fetch Error] {e}")
        return []

# Count failed attempts grouped by IP address and save to DB
def count_failed_attempts_by_ip(logs):
    try:
        messages = [log.get("Message", "") for log in logs]
        combined_logs = "\n".join(messages)

        ips = re.findall(r"\b(?:\d{1,3}\.){3}\d{1,3}\b", combined_logs)
        ip_counts = Counter(ips)

        print(f"[IP Fail Count] {ip_counts}")

        for ip, count in ip_counts.items():
            log_entry = SSHLog.query.filter_by(ip_address=ip).first()

            if log_entry:
                log_entry.ip_fail_count = count
            else:
                new_log = SSHLog(ip_address=ip, ip_fail_count=count)
                db.session.add(new_log)

        db.session.commit()

        return [
            {"IPAddress": ip, "FailAttempt": count}
            for ip, count in ip_counts.items()
        ]

    except Exception as e:
        db.session.rollback()
        print("[IP Count Exception]", str(e))
        traceback.print_exc()
        return []

def emit_ssh_logs_periodically(app):
    global last_processed_time

    with app.app_context():
        while True:
            try:
                logs = fetch_failed_ssh_logs()

                if not logs:
                    if last_processed_time is not None:
                        last_processed_time = None 
                        socketio.emit("ssh_log_cleared")
                    time.sleep(1)
                    continue

                # 1. Update IP counts (Always update table)
                ip_fail_data = count_failed_attempts_by_ip(logs)
                socketio.emit("ssh_failed_ip_count", ip_fail_data)

                new_entries = []
                
                # 2. Logic for detecting NEW entries
                if last_processed_time is None:
                    new_entries = logs
                else:
                    for log in logs:
                        if log["TimeCreated"] > last_processed_time:
                            new_entries.append(log)

                # 3. Emit the entries
                for entry in new_entries:
                    timestamp = convert_timestamp(entry["TimeCreated"])
                    socketio.emit(
                        "ssh_attempt",
                        {
                            "timestamp": timestamp,
                            "message": entry["Message"],
                        },
                    )

                # 4. Update the bookmark
                if logs:
                    last_processed_time = logs[-1]["TimeCreated"]

                time.sleep(1)

            except Exception:
                traceback.print_exc()
                time.sleep(5)


# Start the log thread
def start_log_thread(app):
    global log_thread_started

    if not log_thread_started:
        log_thread_started = True

        threading.Thread(
            target=emit_ssh_logs_periodically,
            args=(app,),
            daemon=True,
        ).start()


# WebSocket connection
@socketio.on("connect")
def on_client_connect():
    global clients_sent_full_history

    sid = request.sid
    print(f"[WebSocket] Client connected: {sid}")

    try:
        result = subprocess.run(
            ["systemctl", "is-active", "ssh"],
            capture_output=True,
            text=True,
        )

        if result.returncode == 0:
            current_status = result.stdout.strip()
            socketio.emit("ssh_status", {"status": current_status}, to=sid)

    except Exception as e:
        print("[Initial SSH Status Exception]", str(e))

    if sid not in clients_sent_full_history:
        logs = fetch_failed_ssh_logs()

        for entry in logs:
            timestamp = convert_timestamp(entry.get("TimeCreated", ""))
            message = entry.get("Message", "")

            socketio.emit(
                "ssh_attempt",
                {
                    "timestamp": timestamp,
                    "message": message,
                },
                to=sid,
            )

        clients_sent_full_history.add(sid)


@socketio.on("disconnect")
def on_client_disconnect():
    sid = request.sid
    print(f"[WebSocket] Client disconnected: {sid}")
    clients_sent_full_history.discard(sid)




