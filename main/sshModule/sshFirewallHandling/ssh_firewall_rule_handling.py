import subprocess


def run_cmd(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)


def replace_ssh_firewall_rule(ip, action):
    action = action.upper()

    if action not in {"ALLOW", "BLOCK"}:
        return False, f"Invalid action: {action}"

    try:
        # Remove existing ACCEPT rule
        run_cmd([
            "iptables", "-D", "INPUT",
            "-p", "tcp",
            "--dport", "22",
            "-s", ip,
            "-j", "ACCEPT"
        ])

        # Remove existing DROP rule
        run_cmd([
            "iptables", "-D", "INPUT",
            "-p", "tcp",
            "--dport", "22",
            "-s", ip,
            "-j", "DROP"
        ])

        if action == "ALLOW":
            result = run_cmd([
                "iptables", "-I", "INPUT",
                "-p", "tcp",
                "--dport", "22",
                "-s", ip,
                "-j", "ACCEPT"
            ])

        else:  # BLOCK
            result = run_cmd([
                "iptables", "-I", "INPUT",
                "-p", "tcp",
                "--dport", "22",
                "-s", ip,
                "-j", "DROP"
            ])

        if result.returncode == 0:
            return True, f"{ip} has been {action}ED for SSH"
        else:
            return False, result.stderr.strip()

    except Exception as e:
        return False, str(e)