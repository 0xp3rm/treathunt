import subprocess
from flask import Blueprint, jsonify

sysinfo_blueprint = Blueprint("sysinfo_blueprint", __name__)


def run_cmd(cmd):
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.stdout.strip() if result.returncode == 0 else ""


def get_os_release():
    info = {}
    try:
        with open("/etc/os-release") as f:
            for line in f:
                if "=" in line:
                    key, value = line.strip().split("=", 1)
                    info[key] = value.strip('"')
    except Exception:
        pass
    return info


def get_meminfo():
    mem = {}
    try:
        with open("/proc/meminfo") as f:
            for line in f:
                key, value = line.split(":")
                mem[key.strip()] = value.strip()
    except Exception:
        pass
    return mem


@sysinfo_blueprint.route("/sysinfo", methods=["GET"])
def getSysInfo():
    try:
        os_info = get_os_release()
        mem_info = get_meminfo()

        systeminfo = {
            "OsName": os_info.get("PRETTY_NAME", ""),
            "OsKernel": run_cmd(["uname", "-r"]),
            "Hostname": run_cmd(["hostname"]),
            "MachineModel": run_cmd(["cat", "/sys/class/dmi/id/product_name"]),
            "BiosName": run_cmd(["cat", "/sys/class/dmi/id/bios_version"]),
            "BiosManufacturer": run_cmd(["cat", "/sys/class/dmi/id/bios_vendor"]),
            "SystemRoot": "/",
            "OsBuildType": run_cmd(["uname", "-m"]),
            "BootDevice": run_cmd(["findmnt", "-n", "-o", "SOURCE", "/"]),
            "FreePhysicalMemory": mem_info.get("MemAvailable", ""),
            "TotalPhysicalMemory": mem_info.get("MemTotal", ""),
            "InUseMemory": mem_info.get("MemTotal", ""),
        }

        return jsonify({
            "success": True,
            "systeminfo": systeminfo
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        })
