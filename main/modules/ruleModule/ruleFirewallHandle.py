from flask import Blueprint, jsonify, request
import subprocess
import ipaddress
import re

rules_firewall_handler_bp = Blueprint("rule_add_firewall_handler_bp", __name__)

def run_cmd(cmd):
    """Helper to run shell commands"""
    return subprocess.run(cmd, capture_output=True, text=True)

@rules_firewall_handler_bp.route("/addfirewall", methods=["POST"])
def add_rule_firewall():
    getRulename = request.form.get("rulename")
    getRuledirection = request.form.get("ruledirection") 
    getRuleprotocol = request.form.get("ruleprotocol").lower() 
    getRuleaction = request.form.get("ruleaction") 
    getLocalport = request.form.get("localport")
    getRemoteaddress = request.form.get("remoteaddress")

    chain = "INPUT" if getRuledirection == "Inbound" else "OUTPUT"
    target = "ACCEPT" if getRuleaction == "Allow" else "DROP"
    if getRuleprotocol == "icmpv4": getRuleprotocol = "icmp"

    comment = f"USER_FIREWALL_{getRulename}"

    check_exist = run_cmd(["iptables", "-S", chain])
    if comment in check_exist.stdout:
        return jsonify({"message": "Rule with this name already exists"}), 200

    cmd = ["iptables", "-A", chain, "-p", getRuleprotocol]
    
    if getRemoteaddress:
        cmd += ["-s" if chain == "INPUT" else "-d", getRemoteaddress]
    
    if getLocalport and getRuleprotocol in ["tcp", "udp"]:
        cmd += ["--dport", getLocalport]

    cmd += ["-m", "comment", "--comment", comment, "-j", target]

    result = run_cmd(cmd)

    if result.returncode == 0:
        return jsonify({"message": "Firewall rule created successfully"})
    return jsonify({"status": "error", "error": result.stderr}), 400

@rules_firewall_handler_bp.route("/showfirewall", methods=["GET"])
def list_user_firewall_rules():
    try:
        result = run_cmd(["iptables", "-S"])
        lines = result.stdout.splitlines()
        
        rules = []
        for line in lines:
            if "USER_FIREWALL_" in line:
                name = re.search(r'--comment USER_FIREWALL_(\S+)', line)
                proto = re.search(r'-p (\S+)', line)
                dport = re.search(r'--dport (\d+)', line)
                addr = re.search(r'-[sd] (\S+)', line)
                action = "Allow" if "-j ACCEPT" in line else "Block"
                direction = "Inbound" if "-A INPUT" in line else "Outbound"

                rules.append({
                    "DisplayName": name.group(1) if name else "Unknown",
                    "Direction": direction,
                    "Action": action,
                    "Protocol": proto.group(1).upper() if proto else "Any",
                    "LocalPort": dport.group(1) if dport else "Any",
                    "RemoteAddress": addr.group(1) if addr else "Any",
                    "Enabled": True
                })

        return jsonify({"status": "success", "rules": rules})
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500

@rules_firewall_handler_bp.route("/deletefirewall", methods=["DELETE"])
def delete_Firewall_Rule():
    rule_name = request.form.get("ruleName")
    comment = f"USER_FIREWALL_{rule_name}"

    for chain in ["INPUT", "OUTPUT"]:
        check = run_cmd(["iptables", "-L", chain, "--line-numbers"])
        for line in check.stdout.splitlines():
            if comment in line:
                rule_num = line.split()[0]
                del_res = run_cmd(["iptables", "-D", chain, rule_num])
                if del_res.returncode == 0:
                    return jsonify({"message": f"Rule '{rule_name}' deleted successfully."})

    return jsonify({"message": f"Rule {rule_name} does not exist."}), 404
