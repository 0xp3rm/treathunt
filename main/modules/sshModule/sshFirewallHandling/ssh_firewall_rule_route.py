import subprocess
from flask import jsonify, Blueprint, request
from main.models import db, SSHLog
import ipaddress
from main.modules.sshModule.sshFirewallHandling.ssh_firewall_rule_handling import (
    replace_ssh_firewall_rule,
)

ssh_firewall_handler = Blueprint("ssh_firewall_handler", __name__)


def check_iptables_rule(ip, action):
    """
    Check if iptables rule already exists
    """
    try:
        result = subprocess.run(
            ["iptables", "-L", "INPUT", "-n"],
            capture_output=True,
            text=True
        )

        if result.returncode != 0:
            return False

        lines = result.stdout.splitlines()

        for line in lines:
            if ip in line and "tcp" in line and "dpt:22" in line:
                if action == "ALLOW" and "ACCEPT" in line:
                    return True
                if action == "BLOCK" and ("DROP" in line or "REJECT" in line):
                    return True

        return False

    except Exception:
        return False


@ssh_firewall_handler.route("/allow", methods=["POST"])
def ssh_allow_IP():
    ipAddress = request.form.get("ipAddress")

    if not ipAddress:
        return jsonify({"error": "Missing IP address"}), 400

    try:
        ipaddress.ip_address(ipAddress)
    except ValueError:
        return jsonify({"error": f"Invalid IP {ipAddress}"}), 400

    IP_exist = SSHLog.query.filter_by(ip_address=ipAddress).first()

    if not IP_exist:
        return jsonify({"error": f"{ipAddress} not found in SSH Logs"}), 404

    if check_iptables_rule(ipAddress, "ALLOW"):
        return jsonify({"message": f"{ipAddress} already exists in ALLOW list"}), 200

    success, message = replace_ssh_firewall_rule(ipAddress, "ALLOW")

    if success:
        return jsonify({"success": message})
    else:
        return jsonify({"error": message}), 500


@ssh_firewall_handler.route("/block", methods=["POST"])
def ssh_block_IP():
    ipAddress = request.form.get("ipAddress")

    if not ipAddress:
        return jsonify({"error": "Missing IP address"}), 400

    try:
        ipaddress.ip_address(ipAddress)
    except ValueError:
        return jsonify({"error": f"Invalid IP {ipAddress}"}), 400

    ip_record = SSHLog.query.filter_by(ip_address=ipAddress).first()

    if not ip_record:
        return jsonify({"error": f"{ipAddress} not found in SSH Logs"}), 404

    if check_iptables_rule(ipAddress, "BLOCK"):
        return jsonify({"message": f"{ipAddress} already exists in BLOCK list"}), 200

    success, message = replace_ssh_firewall_rule(ipAddress, "BLOCK")

    if success:
        return jsonify({"success": message})
    else:
        return jsonify({"error": message}), 500


@ssh_firewall_handler.route("/delete", methods=["DELETE"])
def ssh_delete_IP():
    ipAddress = request.form.get("ipAddress")

    if not ipAddress:
        return jsonify({"error": "Missing IP address"}), 400

    try:
        ipaddress.ip_address(ipAddress)
    except ValueError:
        return jsonify({"error": f"Invalid IP {ipAddress}"}), 400

    deleted = False

    try:
        subprocess.run(
            [
                "iptables", "-D", "INPUT",
                "-p", "tcp",
                "--dport", "22",
                "-s", ipAddress,
                "-j", "ACCEPT"
            ],
            capture_output=True,
            text=True
        )

        subprocess.run(
            [
                "iptables", "-D", "INPUT",
                "-p", "tcp",
                "--dport", "22",
                "-s", ipAddress,
                "-j", "DROP"
            ],
            capture_output=True,
            text=True
        )

        deleted = True

    except Exception:
        pass

    if not deleted:
        return jsonify({"error": f"No firewall rule found for IP {ipAddress}"}), 404

    return jsonify({"success": "Firewall rule deleted successfully"}), 200

@ssh_firewall_handler.route("/clear", methods=["POST"])
def clear_Ssh_Logs():
    try:
        log_count = SSHLog.query.count()

        if log_count == 0:
            return jsonify({"error": "SSH logs is empty."}), 200

        subprocess.run(
            ["sudo", "truncate", "-s", "0", "/var/log/auth.log"],
            capture_output=True,
            text=True
        )

        # Clear database logs
        SSHLog.query.delete()
        db.session.commit()

        return jsonify({"success": "SSH logs deleted successfully"})

    except Exception as db_error:
        db.session.rollback()

        return jsonify({
            "error": f"Failed to clear database logs: {str(db_error)}"
        }), 500