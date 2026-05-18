<strong>ThreatHunt</strong> - is a tool that uses Event Viewer or log files to identify anomalies or intrusions against services such as SSH. It allows users to create firewall rules to permit or block specific connections, enhancing system protection. Additionally, it logs remote address connections to perform lookups and retrieve detailed information about those addresses.

----

#### Features
- <strong>SSH Intrusion Detection:</strong> The system will evaluate the system's ability to detect potential intrusions and anomalies using the SSH log data of Windows or Linux Events.

- <strong>SSH Logs Monitoring:</strong> The system will examine the system's log monitoring capabilities and its ability to provide valuable logs and data for forensic analysis.

- <strong>Firewall Creation:</strong> The system will implement rules to block potential attacks and prevent unauthorized access to open services.

- <strong>Monitoring TCP Connection:</strong> The system will monitor listening and outgoing network connections.

- <strong>Lookup IP Address:</strong> Perform IP address lookups for IPs in found in the data logs.

---

#### Limitations
- <strong>Specific Threats:</strong> The tool will focus on specific security threats, such as brute force attacks on Secure Shell, other failed login attempts will not include other types of threats.

- <strong>Data Quality:</strong> The tool ability to detect threats depends on the quality and amount of log data, which could lead to errors in detection.

- <strong>Non-Technical Factors:</strong> The system doesn't address other important factors like staff training or organizational culture, which are also needed for strong security.

---

#### TechStack
- Languages: Python, Powershell, Javascript
- Database: SQLite
- Tools: VSCode, OpenSSH-Server
- Environment: Windows Server, Linux Server
- Framework: Flask,  Websocket
- Frontend: HTML5 , CSS , JS , Bootstrap

---
#### Live Test Endpoint
👉 http://srv1464717.hstgr.cloud:1337

- USERNAME = admin
- PASSWORD = admin
