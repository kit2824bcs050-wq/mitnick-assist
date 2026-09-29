import json
import socket
import subprocess
import time
from datetime import datetime
from pathlib import Path

import psutil


INTERVAL = 5

BASE_DIR = Path(__file__).resolve().parent
LOG_DIR = BASE_DIR / "logs"
LOG_FILE = LOG_DIR / "real_telemetry.jsonl"

LOG_DIR.mkdir(parents=True, exist_ok=True)


AUTH_PATTERNS = (
    "failed password",
    "authentication failure",
    "failed login",
    "invalid user",
)


def get_default_interface():
    try:
        with open("/proc/net/route", "r") as route_file:
            next(route_file)

            for line in route_file:
                fields = line.split()

                if len(fields) < 4:
                    continue

                interface = fields[0]
                destination = fields[1]
                flags = int(fields[3], 16)

                if destination == "00000000" and flags & 2:
                    return interface

    except Exception:
        pass

    for name, info in psutil.net_if_stats().items():
        if name != "lo" and info.isup:
            return name

    raise RuntimeError("No active network interface found")


def get_interface_ips(interface):
    addresses = psutil.net_if_addrs().get(
        interface,
        [],
    )

    return {
        address.address.split("%")[0]
        for address in addresses
        if address.family in (
            socket.AF_INET,
            socket.AF_INET6,
        )
    }


def connection_snapshot(local_ips):
    connections = set()

    try:
        for conn in psutil.net_connections(
            kind="inet"
        ):
            if not conn.raddr:
                continue

            if not conn.laddr:
                continue

            local_ip = conn.laddr.ip.split("%")[0]

            if local_ip not in local_ips:
                continue

            remote_ip = conn.raddr.ip
            remote_port = conn.raddr.port

            connections.add(
                (
                    remote_ip,
                    remote_port,
                )
            )

    except (
        psutil.AccessDenied,
        PermissionError,
    ):
        pass

    return connections


def count_auth_failures(seconds):
    try:
        result = subprocess.run(
            [
                "journalctl",
                "--since",
                f"{seconds} seconds ago",
                "--no-pager",
                "-o",
                "cat",
            ],
            capture_output=True,
            text=True,
            timeout=3,
        )

        if result.returncode != 0:
            return 0

        count = 0

        for line in result.stdout.splitlines():
            lowered = line.lower()

            if any(
                pattern in lowered
                for pattern in AUTH_PATTERNS
            ):
                count += 1

        return count

    except Exception:
        return 0


def write_log(record):
    with LOG_FILE.open(
        "a",
        encoding="utf-8",
    ) as log_file:
        log_file.write(
            json.dumps(record) + "\n"
        )


def main():
    interface = get_default_interface()

    counters = psutil.net_io_counters(
        pernic=True
    )

    if interface not in counters:
        raise RuntimeError(
            f"No counters available for {interface}"
        )

    previous_io = counters[interface]

    local_ips = get_interface_ips(
        interface
    )

    previous_connections = (
        connection_snapshot(local_ips)
    )

    print("=" * 60)
    print("MITNICK ASSIST REAL TELEMETRY SENSOR")
    print("=" * 60)
    print(f"[INTERFACE] {interface}")
    print(f"[INTERVAL] {INTERVAL}s")
    print(f"[LOG] {LOG_FILE}")
    print("[STATUS] Monitoring real host telemetry")
    print("=" * 60)

    try:
        while True:
            time.sleep(INTERVAL)

            counters = psutil.net_io_counters(
                pernic=True
            )

            current_io = counters.get(
                interface
            )

            if current_io is None:
                continue

            current_connections = (
                connection_snapshot(
                    local_ips
                )
            )

            new_connections = (
                current_connections
                - previous_connections
            )

            unique_ports = len(
                {
                    port
                    for _, port
                    in new_connections
                }
            )

            packet_delta = (
                current_io.packets_sent
                + current_io.packets_recv
                - previous_io.packets_sent
                - previous_io.packets_recv
            )

            bytes_out_delta = (
                current_io.bytes_sent
                - previous_io.bytes_sent
            )

            telemetry = {
                "timestamp":
                    datetime.now().isoformat(),

                "node":
                    "HOST-SENSOR-01",

                "type":
                    "FEATURES_REAL",

                "interface":
                    interface,

                "auth_failures":
                    count_auth_failures(
                        INTERVAL
                    ),

                "unique_ports":
                    unique_ports,

                "connection_rate":
                    round(
                        len(new_connections)
                        / INTERVAL,
                        2,
                    ),

                "packet_rate":
                    round(
                        max(
                            packet_delta,
                            0,
                        )
                        / INTERVAL,
                        2,
                    ),

                "bytes_out": max(
                   bytes_out_delta,
                   0,
                ),

                "bytes_out_rate": round(
                   max(bytes_out_delta, 0) / INTERVAL,
                   2,
                ),


            }

            print(
                json.dumps(
                    telemetry,
                    indent=2,
                )
            )

            write_log(telemetry)

            previous_io = current_io
            previous_connections = (
                current_connections
            )

    except KeyboardInterrupt:
        print()
        print(
            "[STOP] Real telemetry sensor "
            "stopped safely."
        )


if __name__ == "__main__":
    main()
