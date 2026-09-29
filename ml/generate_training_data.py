import csv
import random
from pathlib import Path

random.seed(42)

OUTPUT = Path("ml/data/training.csv")
OUTPUT.parent.mkdir(parents=True, exist_ok=True)

HEADER = [
    "auth_failures",
    "unique_ports",
    "connection_rate",
    "packet_rate",
    "bytes_out",
    "label",
]


def normal():
    return [
        random.randint(0, 2),
        random.randint(1, 4),
        round(random.uniform(1.0, 6.0), 2),
        round(random.uniform(5.0, 30.0), 2),
        random.randint(500, 2500),
        "NORMAL",
    ]


def brute_force():
    return [
        random.randint(8, 30),
        random.randint(1, 4),
        round(random.uniform(8.0, 25.0), 2),
        round(random.uniform(40.0, 120.0), 2),
        random.randint(1500, 5000),
        "BRUTE_FORCE",
    ]


def port_scan():
    return [
        random.randint(0, 3),
        random.randint(10, 60),
        round(random.uniform(20.0, 60.0), 2),
        round(random.uniform(80.0, 250.0), 2),
        random.randint(2500, 10000),
        "PORT_SCAN",
    ]


rows = []

for _ in range(3000):
    rows.append(normal())
    rows.append(brute_force())
    rows.append(port_scan())

random.shuffle(rows)

with OUTPUT.open("w", newline="") as file:
    writer = csv.writer(file)
    writer.writerow(HEADER)
    writer.writerows(rows)

print(f"[OK] Generated {len(rows)} training samples")
print(f"[OK] Dataset saved to {OUTPUT}")
