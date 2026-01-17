"""
XSS (Cross-Site Scripting) attack simulation.
"""

from .attack_tools import get_forms, make_id
from app.models import Asset, Evidence, Finding, Severity
import requests
import re

# Common XSS payloads for testing
DEFAULT_XSS_PAYLOADS = [
    "<script>alert('XSS')</script>",
    "<img src=x onerror=alert('XSS')>",
    "<svg onload=alert('XSS')>",
    "javascript:alert('XSS')",
    "<iframe src='javascript:alert(\"XSS\")'></iframe>",
    "<body onload=alert('XSS')>",
    "'\"><script>alert(String.fromCharCode(88,83,83))</script>",
    "<script>alert(document.cookie)</script>",
    "<img src=\"javascript:alert('XSS')\">",
    "<<SCRIPT>alert('XSS');//<</SCRIPT>",
]

def xss_findings(target_url: str, run_id: str) -> list[Finding]:
    """Test for XSS (Cross-Site Scripting) vulnerabilities in forms and URL parameters.

    Args:
        target_url (str): The target URL to test.
        run_id (str): A unique identifier for the test run.

    Returns:
        list[Finding]: A list of findings related to XSS vulnerabilities.
    """
    findings: list[Finding] = []
    forms, fetched = get_forms(target_url)
    executed = fetched

    # Test forms for XSS
    for form in forms[:5]:
        for payload in DEFAULT_XSS_PAYLOADS[:3]:  # Test with first 3 payloads
            data = {}
            reflected_inputs = []
            
            for inp in form.inputs:
                if inp["type"] in {"text", "search", "email", "url"}:
                    data[inp["name"]] = payload
                    reflected_inputs.append(inp["name"])
                elif inp["type"] == "hidden":
                    data[inp["name"]] = inp.get("value", "")
                else:
                    data[inp["name"]] = "test"

            if not reflected_inputs:
                continue

            try:
                if form.method == "get":
                    response = requests.get(form.action, params=data, timeout=5)
                else:
                    response = requests.post(form.action, data=data, timeout=5)
                
                executed = True
                response_body = response.text

                # Check if payload is reflected in response without encoding
                if is_xss_vulnerable(response_body, payload):
                    findings.append(
                        Finding(
                            id=make_id("LAB-XSS"),
                            asset=Asset(type="url", value=form.action),
                            category="OWASP A03",
                            check="lab_xss_reflected",
                            severity=Severity.HIGH,
                            summary="Possible reflected XSS vulnerability detected in form submission",
                            evidence=Evidence(
                                details=f"Payload was reflected without proper encoding. Method: {form.method.upper()}. Payload: {payload}. Vulnerable input(s): {', '.join(reflected_inputs)}"
                            ),
                            remediation=[
                                "Implement proper output encoding for user input",
                                "Use Content Security Policy (CSP) headers",
                                "Validate and sanitize all user inputs",
                                "Use HTTP-only cookies for sensitive data",
                                "Implement context-aware output encoding (HTML, JavaScript, CSS, URL)",
                            ],
                            source="lab_attack",
                            run_id=run_id,
                        )
                    )
                    break  # Found vulnerability in this form, move to next

            except requests.RequestException:
                pass

    # Test URL parameters for XSS
    if "?" in target_url:
        base_url = target_url.split("?")[0]
        params_str = target_url.split("?")[1]
        params = {}
        
        for param_pair in params_str.split("&"):
            if "=" in param_pair:
                key, value = param_pair.split("=", 1)
                params[key] = value

        # Test each parameter with XSS payload
        for param_name in list(params.keys())[:3]:  # Test first 3 parameters
            test_params = params.copy()
            payload = DEFAULT_XSS_PAYLOADS[0]
            test_params[param_name] = payload

            try:
                response = requests.get(base_url, params=test_params, timeout=5)
                executed = True

                if is_xss_vulnerable(response.text, payload):
                    findings.append(
                        Finding(
                            id=make_id("LAB-XSS"),
                            asset=Asset(type="url", value=target_url),
                            category="OWASP A03",
                            check="lab_xss_url_parameter",
                            severity=Severity.HIGH,
                            summary="Possible reflected XSS vulnerability detected in URL parameter",
                            evidence=Evidence(
                                details=f"URL parameter '{param_name}' reflects unencoded input. Payload: {payload}"
                            ),
                            remediation=[
                                "Implement proper output encoding for URL parameters",
                                "Use Content Security Policy (CSP) headers",
                                "Validate and sanitize all URL parameters",
                                "Use allowlisting for expected parameter values",
                            ],
                            source="lab_attack",
                            run_id=run_id,
                        )
                    )
            except requests.RequestException:
                pass

    return findings


def is_xss_vulnerable(response_body: str, payload: str) -> bool:
    """Check if the response body contains the XSS payload without proper encoding.

    Args:
        response_body (str): The HTTP response body.
        payload (str): The XSS payload that was submitted.

    Returns:
        bool: True if payload is reflected without encoding, False otherwise.
    """
    # Check for exact payload reflection
    if payload in response_body:
        return True

    # Check for common XSS indicators in response
    dangerous_patterns = [
        r"<script[^>]*>.*?alert",
        r"onerror\s*=\s*['\"]?alert",
        r"onload\s*=\s*['\"]?alert",
        r"javascript:\s*alert",
    ]

    for pattern in dangerous_patterns:
        if re.search(pattern, response_body, re.IGNORECASE):
            return True

    return False
