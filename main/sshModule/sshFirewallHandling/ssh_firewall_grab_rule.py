import subprocess
from flask import Blueprint, jsonify
import re

ssh_firewall_get_allow_block_rule_bp = Blueprint(
    "ssh_firewall_get_allow_block_rule_bp", __name__
)


def get_iptables_rules():
    try:
        result = subprocess.run(
            ["iptables", "-L", "INPUT", "-n"],
            capture_output=True,
            text=True,
            check=True,
        )
        return result.stdout
    except subprocess.CalledProcessError as e:
        raise RuntimeError(e.stderr.strip() or "Failed to retrieve firewall rules")


@ssh_firewall_get_allow_block_rule_bp.route("/allowssh", methods=["GET"])
def get_ssh_allow_firewall_rule():
    try:
        rules = get_iptables_rules()

        allowed_ips = []

        for line in rules.splitlines():
            if "ACCEPT" in line and "tcp" in line and "dpt:22" in line:
                parts = line.split()
                ip = parts[3]  

                if ip != "0.0.0.0/0":
                    allowed_ips.append(ip)

        return jsonify({"ips": allowed_ips})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@ssh_firewall_get_allow_block_rule_bp.route("/blockssh", methods=["GET"])
def get_ssh_block_firewall_rule():
    try:
        rules = get_iptables_rules()

        blocked_ips = []

        for line in rules.splitlines():
            if ("DROP" in line or "REJECT" in line) and "tcp" in line and "dpt:22" in line:
                parts = line.split()
                ip = parts[3]

                if ip != "0.0.0.0/0":
                    blocked_ips.append(ip)

        return jsonify({"ips": blocked_ips})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
