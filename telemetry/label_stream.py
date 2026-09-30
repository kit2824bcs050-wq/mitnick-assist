import argparse
import csv
import json
import time
from pathlib import Path


SOURCE = Path("telemetry/logs/real_telemetry.jsonl")
OUTPUT = Path("ml/data/real_labeled.csv")

FEATURES = [
    "auth_failures",
    "unique_ports",
    "connection_rate",
    "packet_rate",
    "bytes_out_rate",
]

VALID_LABELS = {
    "NORMAL",
    "PORT_SCAN",
    "BRUTE_FORCE",
}


def create_output():
    OUTPUT.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    if not OUTPUT.exists():
        with OUTPUT.open(
            "w",
            newline="",
            encoding="utf-8",
        ) as file:
            writer = csv.writer(file)

            writer.writerow(
                [
                    "timestamp",
                    "node",
                    *FEATURES,
                    "label",
                ]
            )


def valid_record(record):
    if record.get("type") != "FEATURES_REAL":
        return False

    return all(
        feature in record
        for feature in FEATURES
    )


def main():
    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--label",
        required=True,
        choices=sorted(VALID_LABELS),
    )

    args = parser.parse_args()

    create_output()

    print("=" * 60)
    print("MITNICK ASSIST REAL DATA LABELER")
    print("=" * 60)
    print(f"[LABEL] {args.label}")
    print(f"[SOURCE] {SOURCE}")
    print(f"[OUTPUT] {OUTPUT}")
    print("[INFO] Only NEW telemetry will be labeled.")
    print("=" * 60)

    while not SOURCE.exists():
        print("[WAIT] Waiting for telemetry...")
        time.sleep(1)

    try:
        with SOURCE.open(
            "r",
            encoding="utf-8",
        ) as source:

            # Ignore historical records.
            source.seek(0, 2)

            while True:
                line = source.readline()

                if not line:
                    time.sleep(0.5)
                    continue

                try:
                    record = json.loads(line)

                except json.JSONDecodeError:
                    continue

                if not valid_record(record):
                    continue

                row = [
                    record.get("timestamp"),
                    record.get("node"),
                    *[
                        record[feature]
                        for feature in FEATURES
                    ],
                    args.label,
                ]

                with OUTPUT.open(
                    "a",
                    newline="",
                    encoding="utf-8",
                ) as output:

                    writer = csv.writer(output)
                    writer.writerow(row)

                print(
                    f"[{args.label}] "
                    f"ports={record['unique_ports']} "
                    f"conn={record['connection_rate']} "
                    f"pkt={record['packet_rate']} "
                    f"bytes/s={record['bytes_out_rate']}"
                )

    except KeyboardInterrupt:
        print()
        print("[STOP] Labeling stopped safely.")


if __name__ == "__main__":
    main()
