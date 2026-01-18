"""
Run all security attack simulations.
"""

from app.attacks.sql_injection import sql_injection_findings
from app.attacks.csrf import csrf_findings
from app.attacks.least_privilege import least_privilege_findings
from app.attacks.credential_stuffing import credential_stuffing_findings
from app.attacks.dos import run_dos_simulations
from app.attacks.brute_force import brute_force_findings
from app.models import Finding

def run_lab_attacks(target_url: str, run_id: str) -> list[Finding]:
    """Run all security attack simulations on the target URL.

    Args:
        target_url (str): The target URL to test.
        run_id (str): A unique identifier for the test run.

    Returns:
        list[Finding]: A list of findings from all attack simulations.
    """
    findings: list[Finding] = []

    findings.extend(sql_injection_findings(target_url, run_id))
    findings.extend(csrf_findings(target_url, run_id))
    findings.extend(least_privilege_findings(target_url, run_id))
    findings.extend(credential_stuffing_findings(target_url, run_id))
    findings.extend(run_dos_simulations(target_url, run_id))
    findings.extend(brute_force_findings(target_url, run_id))

    return findings
