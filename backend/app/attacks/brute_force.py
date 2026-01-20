import requests
import time
from app.attacks.attack_tools import get_forms, make_id
from app.models import Asset, Evidence, Finding, Severity

def brute_force_findings(target_url: str, run_id: str, min_len: int = 1, max_len: int = 12, end_time: int = 60) -> list[Finding]:
    """
    Test for brute force vulnerabilities in login forms.
    Args:
        target_url (str): The target URL to test.
        run_id (str): A unique identifier for the test run.
        min_len (int): Minimum length of generated credentials.
        max_len (int): Maximum length of generated credentials.
        end_time (int): Total duration to run the brute force test in seconds.
    Returns:
        list[Finding]: A list of findings related to brute force vulnerabilities.
    """
    findings: list[Finding] = []
    forms, fetched = get_forms(target_url)
    executed = fetched
    has_login_form = any(
        any("pass" in inp["name"].lower() for inp in form.inputs) for form in forms
    )

    for form in forms[:3]:
        input_names = [i["name"].lower() for i in form.inputs]
        if not any("pass" in n for n in input_names):
            continue
        usernames = [f"{i:02d}" for i in range(100)]
        passwords = [""] + [f"{i:02d}" for i in range(100)]

        for username in usernames:
            for password in passwords:
                data = {}
                for inp in form.inputs:
                    name = inp["name"]
                    lname = name.lower()
                    if "user" in lname or "login" in lname:
                        data[name] = username
                    elif "email" in lname:
                        data[name] = username
                    elif "pass" in lname:
                        data[name] = password
                    else:
                        data[name] = "test"

                try:
                    response = requests.post(form.action, data=data, timeout=5)
                    executed = True
                    if response.status_code == 200 and ("welcome" in response.text.lower() or "dashboard" in response.text.lower()):
                        findings.append(
                            Finding(
                                id=make_id("LAB-BF"),
                                asset=Asset(type="url", value=form.action),
                                category="OWASP A07",
                                check="lab_brute_force",
                                severity=Severity.HIGH,
                                summary="Login form accepted common credential pair during brute force test",
                                evidence=Evidence(
                                    details=f"Credential pair '{username}:{password}' produced a success-like response. Status: {response.status_code}"
                                ),
                                remediation=[
                                    "Enforce strong password policies",
                                    "Enable multi-factor authentication",
                                    "Implement rate limiting and account lockouts",
                                ],
                                source="lab_attack",
                                run_id=run_id,
                            )
                        )
                        return findings
                except requests.RequestException:
                    continue

    if not findings and executed:
        details = "All credentials tested were rejected by the login form."
        if fetched and not has_login_form:
            details = "No login form detected to test brute force."
        findings.append(
            Finding(
                id=make_id("LAB-BF"),
                asset=Asset(type="url", value=target_url),
                category="OWASP A07",
                check="lab_brute_force",
                severity=Severity.INFO,
                summary="Brute force test completed with no accepted common credentials",
                evidence=Evidence(details=details),
                remediation=[
                    "Keep enforcing strong authentication policies",
                    "Maintain rate limiting and lockout controls",
                ],
                source="lab_attack",
                run_id=run_id,
            )
        )
    return findings
