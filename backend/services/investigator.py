from datetime import datetime


def investigate_alert(alert: dict) -> dict:

    attack = alert.get("attack", "UNKNOWN")
    node = alert.get("node", "UNKNOWN")
    confidence = alert.get("confidence", 0)
    severity = alert.get("severity", "UNKNOWN")

    features = alert.get("features", {})

    auth_failures = features.get("auth_failures", 0)
    unique_ports = features.get("unique_ports", 0)
    connection_rate = features.get("connection_rate", 0)
    packet_rate = features.get("packet_rate", 0)
    bytes_out = features.get("bytes_out", 0)

    evidence = [
        f"Authentication failures: {auth_failures}",
        f"Unique ports contacted: {unique_ports}",
        f"Connection rate: {connection_rate}",
        f"Packet rate: {packet_rate}",
        f"Outbound bytes: {bytes_out}",
        f"DNN confidence: {confidence}%",
    ]

    if attack == "BRUTE_FORCE":

        summary = (
            f"Potential credential attack detected on {node}. "
            f"The node generated an abnormal number of failed "
            f"authentication attempts."
        )

        reasoning = (
            f"{auth_failures} authentication failures were observed "
            f"with a connection rate of {connection_rate}. "
            f"This behavior differs from the expected normal profile "
            f"and was classified as BRUTE_FORCE by the DNN."
        )

        recommendations = [
            "Review authentication logs.",
            "Identify the source of repeated login attempts.",
            "Check whether any authentication attempt succeeded.",
            "Rotate credentials if compromise is suspected.",
            "Restrict or isolate the affected node if activity continues.",
        ]

    elif attack == "PORT_SCAN":

        summary = (
            f"Reconnaissance-like activity detected on {node}. "
            f"The node contacted an unusually high number of ports."
        )

        reasoning = (
            f"{unique_ports} unique ports and a connection rate of "
            f"{connection_rate} were observed. "
            f"This pattern is consistent with scanning or reconnaissance."
        )

        recommendations = [
            "Review source and destination addresses.",
            "Inspect which ports were targeted.",
            "Check firewall and access-control logs.",
            "Block suspicious sources if confirmed.",
            "Continue monitoring for follow-up exploitation attempts.",
        ]

    elif attack == "NORMAL":

        summary = (
            f"No significant malicious behavior was detected on {node}."
        )

        reasoning = (
            "Observed telemetry remains within the expected "
            "behavioral profile."
        )

        recommendations = [
            "Continue normal monitoring."
        ]

    else:

        summary = (
            f"Unclassified suspicious activity detected on {node}."
        )

        reasoning = (
            "The detection engine produced an unknown classification."
        )

        recommendations = [
            "Review raw telemetry.",
            "Perform manual SOC investigation.",
        ]

    return {
        "generated_at": datetime.now().isoformat(),
        "node": node,
        "incident": attack,
        "severity": severity,
        "confidence": confidence,
        "summary": summary,
        "reasoning": reasoning,
        "evidence": evidence,
        "recommended_actions": recommendations,
        "analyst_decision_required": True,
    }
