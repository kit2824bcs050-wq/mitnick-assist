import time
import requests
import streamlit as st


API = "http://127.0.0.1:8000"

st.set_page_config(
    page_title="MITNICK ASSIST",
    page_icon="🛡️",
    layout="wide",
)

st.title("🛡️ MITNICK ASSIST")
st.caption("AI-Powered Cyber Defense & SOC Platform")


def get_json(endpoint):
    try:
        response = requests.get(
            f"{API}{endpoint}",
            timeout=3,
        )
        response.raise_for_status()
        return response.json()

    except Exception:
        return None


stats = get_json("/stats")
alerts = get_json("/alerts")
latest = get_json("/alerts/latest")


if stats is None:
    st.error("FastAPI backend is not reachable.")
    st.stop()


# ---------------------------
# TOP METRICS
# ---------------------------

col1, col2, col3, col4, col5 = st.columns(5)

col1.metric(
    "Total Events",
    stats.get("total_events", 0),
)

col2.metric(
    "Attacks",
    stats.get("attacks", 0),
)

col3.metric(
    "Normal",
    stats.get("normal", 0),
)

col4.metric(
    "Brute Force",
    stats.get("brute_force", 0),
)

col5.metric(
    "Port Scan",
    stats.get("port_scan", 0),
)


st.divider()


# ---------------------------
# LATEST ALERT
# ---------------------------

st.subheader("🚨 Latest Security Alert")

if latest and "attack" in latest:

    severity = latest.get(
        "severity",
        "UNKNOWN",
    )

    st.write(
        f"**Node:** "
        f"{latest.get('node')}"
    )

    st.write(
        f"**Attack:** "
        f"{latest.get('attack')}"
    )

    st.write(
        f"**Confidence:** "
        f"{latest.get('confidence')}%"
    )

    st.write(
        f"**Severity:** "
        f"{severity}"
    )

    st.write(
        f"**Status:** "
        f"{latest.get('status')}"
    )

    st.write("**Observed Features:**")

    st.json(
        latest.get(
            "features",
            {},
        )
    )

else:
    st.success(
        "No active attack alerts."
    )


st.divider()


# ---------------------------
# LIVE ALERT TABLE
# ---------------------------

st.subheader("📡 Live Security Events")

if alerts:

    rows = []

    for alert in alerts:

        rows.append({
            "Time":
                alert.get("timestamp"),

            "Node":
                alert.get("node"),

            "Attack":
                alert.get("attack"),

            "Confidence":
                f"{alert.get('confidence')}%",

            "Severity":
                alert.get("severity"),

            "Status":
                alert.get("status"),
        })

    st.dataframe(
        rows,
        use_container_width=True,
    )

else:

    st.info(
        "No attack events detected."
    )


st.divider()


# ---------------------------
# PIPELINE STATUS
# ---------------------------

st.subheader("⚙️ System Status")

c1, c2, c3, c4 = st.columns(4)

c1.success("ESP8266\nACTIVE")
c2.success("DNN\nACTIVE")
c3.success("FastAPI\nONLINE")
c4.info("GenAI\nNEXT")


st.caption(
    "MITNICK ASSIST Prototype SOC Dashboard"
)


# Refresh every 5 seconds
time.sleep(5)
st.rerun()
