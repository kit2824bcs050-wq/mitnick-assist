import json
from datetime import datetime
from pathlib import Path

import serial


SERIAL_PORT = "/dev/ttyUSB0"
BAUD_RATE = 115200

ALLOWED_NODE = "SANDBOX-01"

FEATURE_FILE = Path(
    "collector/logs/security_features.jsonl"
)


def valid_number(value):
    return (
        isinstance(value, (int, float))
        and not isinstance(value, bool)
    )


def validate_packet(data):

    if not isinstance(data, dict):
        return False, "NOT_OBJECT"

    if data.get("node") != ALLOWED_NODE:
        return False, "UNKNOWN_NODE"

    packet_type = data.get("type")

    # -----------------------
    # HEARTBEAT
    # -----------------------

    if packet_type == "HEARTBEAT":

        expected = {
            "node",
            "type",
            "status",
        }

        if set(data.keys()) != expected:
            return False, "INVALID_HEARTBEAT_SCHEMA"

        if data.get("status") != "OK":
            return False, "INVALID_HEARTBEAT"

        return True, "HEARTBEAT"

    # -----------------------
    # FEATURES
    # -----------------------

    if packet_type == "FEATURES":

        expected = {
            "node",
            "type",
            "auth_failures",
            "unique_ports",
            "connection_rate",
            "packet_rate",
            "bytes_out",
        }

        if set(data.keys()) != expected:
            return False, "INVALID_FEATURE_SCHEMA"

        values = {
            "auth_failures":
                (data["auth_failures"], 0, 1000),

            "unique_ports":
                (data["unique_ports"], 0, 65535),

            "connection_rate":
                (data["connection_rate"], 0, 100000),

            "packet_rate":
                (data["packet_rate"], 0, 1000000),

            "bytes_out":
                (data["bytes_out"], 0, 100000000),
        }

        for field, (value, minimum, maximum) in values.items():

            if not valid_number(value):
                return False, f"INVALID_TYPE:{field}"

            if not minimum <= value <= maximum:
                return False, f"OUT_OF_RANGE:{field}"

        return True, "FEATURES"

    return False, "UNKNOWN_PACKET_TYPE"


def save_features(data):

    FEATURE_FILE.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    record = {
        "received_at": datetime.now().isoformat(),
        **data,
    }

    with FEATURE_FILE.open("a") as file:
        file.write(
            json.dumps(record) + "\n"
        )


def main():

    print("=" * 55)
    print("MITNICK ASSIST")
    print("SECURE FEATURE TELEMETRY COLLECTOR")
    print("=" * 55)

    with serial.Serial(
        SERIAL_PORT,
        BAUD_RATE,
        timeout=1,
    ) as device:

        print(
            f"[OK] Listening on {SERIAL_PORT}"
        )

        while True:

            raw = (
                device.readline()
                .decode(
                    "utf-8",
                    errors="ignore",
                )
                .strip()
            )

            if not raw:
                continue

            if not raw.startswith("{"):
                continue

            try:
                data = json.loads(raw)

            except json.JSONDecodeError:
                print("[REJECT] INVALID_JSON")
                continue

            valid, packet_type = validate_packet(data)

            if not valid:
                print(
                    f"[REJECT] {packet_type}"
                )
                continue

            if packet_type == "HEARTBEAT":

                print(
                    "[HEARTBEAT] "
                    "SANDBOX-01 | OK"
                )

                continue

            save_features(data)

            print(
                "[FEATURES] "
                f"AUTH={data['auth_failures']} | "
                f"PORTS={data['unique_ports']} | "
                f"CONN={data['connection_rate']} | "
                f"PKT={data['packet_rate']} | "
                f"BYTES={data['bytes_out']}"
            )


if __name__ == "__main__":

    try:
        main()

    except KeyboardInterrupt:
        print(
            "\n[STOP] MITNICK collector stopped safely."
        )
