"""
Denial of Service (DoS) simulation.
"""

from .attack_tools import make_id
from app.models import Asset, Evidence, Finding, Severity
from concurrent.futures import ThreadPoolExecutor, as_completed
import time
import requests
import subprocess
import sys
import socket
from urllib.parse import urlparse

def dos_simulation_findings(target_url: str, run_id: str, total_requests: int = 10, concurrency: int = 2, timeout_sec: int = 2) -> list[Finding]:
    """Simulate a DoS attack by sending multiple concurrent HTTP requests.

    Args:
        target_url (str): The target URL to test.
        run_id (str): A unique identifier for the test run.
        total_requests (int): Total number of requests to send.
        concurrency (int): Number of concurrent requests.
        timeout_sec (int): Timeout for each request in seconds.

    Returns:
        list[Finding]: A list of findings related to DoS vulnerabilities.
    """

    start = time.time()
    errors = 0
    responses = 0

    def _hit() -> bool | None:
        nonlocal responses
        try:
            response = requests.get(target_url, timeout=timeout_sec)
            responses += 1
            return response.status_code < 500
        except requests.RequestException:
            return None

    with ThreadPoolExecutor(max_workers=concurrency) as pool:
        futures = [pool.submit(_hit) for _ in range(total_requests)]
        for future in as_completed(futures):
            result = future.result()
            if result is False:
                errors += 1

    duration = time.time() - start
    error_rate = errors / max(total_requests, 1)

    if responses == 0:
        return []

    if error_rate >= 0.3:
        return [
            Finding(
                id=make_id("LAB-DOS-HTTP"),
                asset=Asset(type="url", value=target_url),
                category="Availability",
                check="lab_dos_simulation_http",
                severity=Severity.MEDIUM,
                summary="Service showed instability under a small burst of HTTP requests",
                evidence=Evidence(
                    details=f"Error rate: {error_rate:.0%} over {total_requests} HTTP requests in {duration:.2f}s."
                ),
                remediation=[
                    "Add request rate limiting",
                    "Use caching or queueing for expensive operations",
                    "Monitor and autoscale under load",
                ],
                source="lab_attack",
                run_id=run_id,
            )
        ]

    return [
        Finding(
            id=make_id("LAB-DOS-HTTP"),
            asset=Asset(type="url", value=target_url),
            category="Availability",
            check="lab_dos_simulation_http",
            severity=Severity.INFO,
            summary="DoS simulation completed with no significant HTTP errors",
            evidence=Evidence(
                details=f"Error rate: {error_rate:.0%} over {total_requests} HTTP requests in {duration:.2f}s."
            ),
            remediation=[
                "Continue monitoring traffic spikes",
                "Keep rate limiting policies updated",
            ],
            source="lab_attack",
            run_id=run_id,
        )
    ]

def resolve_url_to_ip(url: str) -> str:
    """
    Résout une URL en adresse IP.

    Args:
        url (str): L'URL à résoudre.

    Returns:
        str: L'adresse IP associée à l'URL.

    Raises:
        ValueError: Si l'URL est invalide ou si la résolution échoue.
    """
    try:
        parsed_url = urlparse(url)
        if not parsed_url.hostname:
            raise ValueError("L'URL fournie est invalide.")

        ip_address = socket.gethostbyname(parsed_url.hostname)
        return ip_address
    except socket.gaierror as error:
        raise ValueError(f"Impossible de résoudre l'URL en adresse IP: {error}")

def ping_flood_findings(target_url: str, run_id: str, count: int = 10, interval: float = 0.05) -> list[Finding]:
    """Simulate a Ping Flood DoS attack by sending a high volume of ICMP echo requests.

    Args:
        target_url (str): The target URL to test.
        run_id (str): A unique identifier for the test run.
        count (int): Total number of ICMP echo requests to send.
        interval (float): Interval in seconds between each ICMP request.

    Returns:
        list[Finding]: A list of findings related to Ping Flood vulnerabilities.
    """

    try:
        target_ip = resolve_url_to_ip(target_url)
    except ValueError as error:
        print(f"Erreur: {error}")
        return []

    start = time.time()
    packet_loss = 0

    param = "-n" if sys.platform.startswith("win") else "-c"

    try:
        for _ in range(count):
            command = ["ping", param, "1", target_ip]
            process = subprocess.Popen(
                command,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                universal_newlines=True
            )
            try:
                stdout, stderr = process.communicate(timeout=2)
            except subprocess.TimeoutExpired:
                process.kill()
                stdout, stderr = process.communicate()
                packet_loss += 1
                time.sleep(interval)
                continue

            if process.returncode != 0:
                packet_loss += 1

            time.sleep(interval)

    except subprocess.CalledProcessError as error:
        print(f"Ping command failed with error: {error}")
    except Exception as error:
        print(f"An unexpected error occurred: {error}")

    duration = time.time() - start
    loss_rate = packet_loss / max(count, 1)

    if loss_rate >= 0.3:
        return [
            Finding(
                id=make_id("LAB-DOS-PING"),
                asset=Asset(type="ip", value=target_ip),
                category="Availability",
                check="lab_ping_flood",
                severity=Severity.MEDIUM,
                summary="Target showed instability under a high volume of ICMP echo requests",
                evidence=Evidence(
                    details=f"Packet loss rate: {loss_rate:.0%} over {count} ICMP requests in {duration:.2f}s."
                ),
                remediation=[
                    "Implement ICMP rate limiting on network devices",
                    "Monitor and block abnormal ICMP traffic patterns",
                    "Configure firewalls to restrict ICMP echo requests",
                ],
                source="lab_attack",
                run_id=run_id,
            )
        ]

    return [
        Finding(
            id=make_id("LAB-DOS-PING"),
            asset=Asset(type="ip", value=target_ip),
            category="Availability",
            check="lab_ping_flood",
            severity=Severity.INFO,
            summary="Ping flood simulation completed with no significant packet loss",
            evidence=Evidence(
                details=f"Packet loss rate: {loss_rate:.0%} over {count} ICMP requests in {duration:.2f}s."
            ),
            remediation=[
                "Continue monitoring ICMP traffic for anomalies",
                "Maintain network device configurations to limit ICMP flood risks",
            ],
            source="lab_attack",
            run_id=run_id,
        )
    ]

def run_dos_simulations(target_url: str, run_id: str) -> list[Finding]:
    """Run both HTTP and Ping Flood DoS simulations.

    Args:
        target_url (str): The target URL for both HTTP and Ping Flood simulations.
        run_id (str): A unique identifier for the test run.

    Returns:
        list[Finding]: A combined list of findings from both simulations.
    """

    findings = []
    # Run a lightweight HTTP DoS simulation first (reduced requests)
    findings.extend(dos_simulation_findings(target_url, run_id, total_requests=10, concurrency=2, timeout_sec=2))
    # Then run a short ping flood probe with a small number of pings
    findings.extend(ping_flood_findings(target_url, run_id, count=5, interval=0.02))

    return findings
