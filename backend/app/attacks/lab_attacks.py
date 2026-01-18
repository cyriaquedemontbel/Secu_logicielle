"""Run all security attack simulations."""

import logging
import concurrent.futures
from typing import Callable, Any

from .sql_injection import sql_injection_findings
from .csrf import csrf_findings
from .least_privilege import least_privilege_findings
from .credential_stuffing import credential_stuffing_findings
from .dos import run_dos_simulations, dos_simulation_findings, ping_flood_findings
from .brute_force import brute_force_findings
from app.models import Finding

logger = logging.getLogger(__name__)


def _run_with_timeout(func: Callable[..., list[Finding]], *args: Any, timeout: int = 30) -> list[Finding]:
    """Run `func` in a short-lived thread and return its result or [] on error/timeout."""
    try:
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as ex:
            future = ex.submit(func, *args)
            return future.result(timeout=timeout)
    except concurrent.futures.TimeoutError:
        logger.warning("Attack %s timed out after %ss", getattr(func, "__name__", str(func)), timeout)
        return []
    except Exception:
        logger.exception("Attack %s failed", getattr(func, "__name__", str(func)))
        return []


def run_lab_attacks(target_url: str, run_id: str, attack_options: dict | None = None) -> list[Finding]:
    """Run all security attack simulations on the target URL.

    Each individual attack is executed with a timeout and errors are logged so
    the overall scan can't hang indefinitely on a single slow check.
    """
    findings: list[Finding] = []

    logger.info("[lab_attacks] Starting lab attacks for %s (run=%s)", target_url, run_id)

    # run each attack with a modest timeout to avoid blocking the scan
    findings.extend(_run_with_timeout(sql_injection_findings, target_url, run_id, timeout=40))
    logger.info("[lab_attacks] Completed SQLi (found=%d)", len(findings))

    findings.extend(_run_with_timeout(csrf_findings, target_url, run_id, timeout=25))
    logger.info("[lab_attacks] Completed CSRF (total_found=%d)", len(findings))

    findings.extend(_run_with_timeout(least_privilege_findings, target_url, run_id, timeout=30))
    logger.info("[lab_attacks] Completed least-privilege checks (total_found=%d)", len(findings))

    findings.extend(_run_with_timeout(credential_stuffing_findings, target_url, run_id, timeout=40))
    logger.info("[lab_attacks] Completed credential stuffing (total_found=%d)", len(findings))

    # DoS: allow overriding or disabling via attack_options
    dos_opts = (attack_options or {}).get("dos") if attack_options else None
    if dos_opts is None or dos_opts.get("enabled", True):
        logger.info("[lab_attacks] Starting DoS simulations (run=%s) opts=%s", run_id, dos_opts)
        http_reqs = dos_opts.get("http_requests") if dos_opts else None
        concurrency = dos_opts.get("concurrency") if dos_opts else None
        ping_count = dos_opts.get("ping_count") if dos_opts else None
        duration_sec = dos_opts.get("duration_sec") if dos_opts else None

        def _run_dos():
            # run reduced HTTP DoS first
            findings_local = []
            if http_reqs is not None or concurrency is not None:
                findings_local.extend(dos_simulation_findings(target_url, run_id,
                                                              total_requests=http_reqs or 10,
                                                              concurrency=concurrency or 2,
                                                              timeout_sec=2))
            else:
                findings_local.extend(run_dos_simulations(target_url, run_id))

            if ping_count is not None:
                findings_local.extend(ping_flood_findings(target_url, run_id, count=ping_count))
            return findings_local

        # Use provided duration for timeout (with a small buffer), otherwise default to 15s
        timeout_for_run = (int(duration_sec) + 5) if duration_sec else 15
        # If duration provided but no explicit http_reqs, derive request count from duration
        if duration_sec and http_reqs is None:
            # send ~2 requests per second as a lightweight probe
            http_reqs = max(1, int(duration_sec) * 2)

        findings.extend(_run_with_timeout(_run_dos, timeout=timeout_for_run))
        logger.info("[lab_attacks] Completed DoS simulations (total_found=%d)", len(findings))
    else:
        logger.info("[lab_attacks] DoS simulations disabled by options")

    bf_opts = (attack_options or {}).get("brute_force") if attack_options else None
    if bf_opts is None or bf_opts.get("enabled", True):
        logger.info("[lab_attacks] Starting brute-force checks (run=%s) opts=%s", run_id, bf_opts)
        end_time = bf_opts.get("duration_sec") if bf_opts else None
        if end_time:
            findings.extend(_run_with_timeout(brute_force_findings, target_url, run_id, 1, 12, end_time, timeout= end_time + 5))
        else:
            findings.extend(_run_with_timeout(brute_force_findings, target_url, run_id, timeout=20))
        logger.info("[lab_attacks] Completed brute force (total_found=%d)", len(findings))
    else:
        logger.info("[lab_attacks] Brute-force checks disabled by options")

    logger.info("[lab_attacks] All lab attacks finished for %s (run=%s). Total findings=%d", target_url, run_id, len(findings))
    return findings
