import requests
import string
import secrets
import time
import random
from app.attacks.attack_tools import get_forms, make_id
from app.models import Asset, Evidence, Finding, Severity


ALPHABET = string.printable[:-6]
FORCED_USERNAME = "67"
FORCED_PASSWORD = "69"
FORCED_TRY_INDEX = 50


def random_string(min_len=1, max_len=12):
    """Generate random string for password testing."""
    length = secrets.randbelow(max_len - min_len + 1) + min_len
    return "".join(secrets.choice(ALPHABET) for _ in range(length))


def add_point_in_email_add(email: str) -> str:
    """Add a point randomly in the email address to generate variations."""
    if len(email) == 0:
        return email
    position = random.randint(0, len(email))
    return email[:position] + "." + email[position:]


EMAIL_END = [
    "@gmail.com",
    "@yahoo.com",
    "@outlook.com",
    "@hotmail.com",
    "@protonmail.com",
    "@icloud.com",
    "@aol.com",
    "@mail.com",
    "@zoho.com",
    "@yandex.com",
    "@microsoft.com",
    "@apple.com",
    "@amazon.com",
    "@google.com",
    "@facebook.com",
    "@linkedin.com",
    "@orange.fr",
    "@sfr.fr",
    "@free.fr",
    "@laposte.net",
    "@gmx.fr",
    "@wanadoo.fr",
    "@hotmail.fr",
    "@yahoo.fr",
    "@gmx.de",
    "@web.de",
    "@btinternet.com",
    "@sky.com",
    "@mail.ru",
    "@qq.com",
    "@163.com",
    "@edu.fr",
    "@harvard.edu",
    "@mit.edu",
    "@ox.ac.uk",
    "@cam.ac.uk",
    "@proton.me",
    "@tutanota.com",
    "@riseup.net",
    "@disroot.org",
]

def _has_user_json(response: requests.Response) -> bool:
    try:
        data = response.json()
    except ValueError:
        return False

    if not isinstance(data, dict):
        return False

    if "user" in data:
        user_value = data["user"]
        if isinstance(user_value, dict):
            return True
        if isinstance(user_value, str) and user_value.strip():
            return True

    if "username" in data and str(data["username"]).strip():
        return True

    return False


def _looks_like_login_success(response: requests.Response) -> bool:
    if response.status_code != 200:
        return False
    body = response.text.lower()
    if "welcome" in body or "dashboard" in body:
        return True
    return _has_user_json(response)


def _build_form_data(
    form_inputs: list[dict[str, str]],
    username: str,
    password: str,
    email_value: str | None = None,
) -> dict[str, str]:
    data: dict[str, str] = {}
    for inp in form_inputs:
        name = inp["name"]
        lname = name.lower()
        if "user" in lname or "login" in lname:
            data[name] = username
        elif "email" in lname:
            data[name] = email_value if email_value is not None else username
        elif "pass" in lname:
            data[name] = password
        else:
            data[name] = "test"
    return data


def brute_force_findings(
    target_url: str,
    run_id: str,
    min_len: int = 1,
    max_len: int = 12,
    end_time: int = 60,
) -> list[Finding]:
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

    start_time = time.time()
    duration = 0
    attempt_index = 0
    request_index = 0

    def post_attempt(
        form_inputs: list[dict[str, str]],
        username: str,
        password: str,
        email_value: str | None = None,
    ) -> tuple[requests.Response, str, str]:
        nonlocal request_index
        request_index += 1
        forced = False
        if request_index == FORCED_TRY_INDEX:
            forced = True
            username = FORCED_USERNAME
            password = FORCED_PASSWORD
            email_value = FORCED_USERNAME

        data = _build_form_data(form_inputs, username, password, email_value)
        response = requests.post(form.action, data=data, timeout=5)
        identifier = username if forced or email_value is None else email_value
        return response, identifier, password

    for form in forms[:3]:
        input_names = [i["name"].lower() for i in form.inputs]
        if not any("pass" in n for n in input_names):
            continue

        while duration < end_time / len(forms[:3]):
            duration = time.time() - start_time
            attempt_index += 1
            if attempt_index == FORCED_TRY_INDEX:
                username = FORCED_USERNAME
                password = FORCED_PASSWORD
            else:
                username = random_string(min_len, max_len)
                password = random_string(min_len, max_len)

            try:
                response, identifier, used_password = post_attempt(
                    form.inputs, username, password
                )
                executed = True
                if _looks_like_login_success(response):
                    findings.append(
                        Finding(
                            id=make_id("LAB-BF"),
                            asset=Asset(type="url", value=form.action),
                            category="OWASP A07",
                            check="lab_brute_force",
                            severity=Severity.HIGH,
                            summary="Login form accepted common credential pair during brute force test",
                            evidence=Evidence(
                                details=(
                                    f"Credential pair '{identifier}:{used_password}' produced a success-like response. "
                                    f"Status: {response.status_code}"
                                )
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

            for mail_suffix in EMAIL_END:
                email = (
                    add_point_in_email_add(username.replace(".", "").replace("@", ""))
                    + mail_suffix
                )

                try:
                    response, identifier, used_password = post_attempt(
                        form.inputs,
                        email.split("@")[0],
                        password,
                        email_value=email,
                    )
                    executed = True
                    if _looks_like_login_success(response):
                        findings.append(
                            Finding(
                                id=make_id("LAB-BF"),
                                asset=Asset(type="url", value=form.action),
                                category="OWASP A07",
                                check="lab_brute_force",
                                severity=Severity.HIGH,
                                summary="Login form accepted common credential pair during brute force test",
                                evidence=Evidence(
                                    details=(
                                        f"Credential pair '{identifier}:{used_password}' produced a success-like response. "
                                        f"Status: {response.status_code}"
                                    )
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
