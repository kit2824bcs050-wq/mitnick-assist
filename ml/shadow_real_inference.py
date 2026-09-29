import json
import time
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn


MODEL_PATH = Path("ml/models/mitnick_dnn.pt")
REAL_LOG = Path("telemetry/logs/real_telemetry.jsonl")
SHADOW_LOG = Path("ml/logs/shadow_predictions.jsonl")

POLL_INTERVAL = 1.0

SHADOW_LOG.parent.mkdir(
    parents=True,
    exist_ok=True,
)


class MitnickDNN(nn.Module):
    def __init__(
        self,
        input_size,
        num_classes,
    ):
        super().__init__()

        self.network = nn.Sequential(
            nn.Linear(input_size, 32),
            nn.ReLU(),
            nn.Dropout(0.20),

            nn.Linear(32, 16),
            nn.ReLU(),
            nn.Dropout(0.10),

            nn.Linear(16, num_classes),
        )

    def forward(self, x):
        return self.network(x)


print("=" * 65)
print("MITNICK ASSIST - REAL TELEMETRY SHADOW ANALYZER")
print("=" * 65)

checkpoint = torch.load(
    MODEL_PATH,
    map_location="cpu",
)

features = checkpoint["features"]

class_to_id = checkpoint["class_to_id"]

id_to_class = {
    value: key
    for key, value in class_to_id.items()
}

scaler_mean = np.array(
    checkpoint["scaler_mean"],
    dtype=np.float32,
)

scaler_scale = np.array(
    checkpoint["scaler_scale"],
    dtype=np.float32,
)

model = MitnickDNN(
    input_size=len(features),
    num_classes=len(class_to_id),
)

model.load_state_dict(
    checkpoint["model_state"]
)

model.eval()


print(f"[MODEL] {MODEL_PATH}")
print(f"[REAL DATA] {REAL_LOG}")
print(f"[SHADOW LOG] {SHADOW_LOG}")
print(f"[FEATURES] {features}")
print("[MODE] SHADOW ONLY - NO DASHBOARD ALERTS")
print("=" * 65)


def already_processed():
    timestamps = set()

    if not SHADOW_LOG.exists():
        return timestamps

    try:
        with SHADOW_LOG.open(
            "r",
            encoding="utf-8",
        ) as file:

            for line in file:
                try:
                    record = json.loads(line)

                    timestamp = record.get(
                        "timestamp"
                    )

                    if timestamp:
                        timestamps.add(
                            timestamp
                        )

                except json.JSONDecodeError:
                    continue

    except Exception:
        pass

    return timestamps


def validate_record(record):
    if record.get("type") != "FEATURES_REAL":
        return False

    for feature in features:
        if feature not in record:
            return False

        if not isinstance(
            record[feature],
            (int, float),
        ):
            return False

    return True


def predict(record):
    raw_values = np.array(
        [
            record[feature]
            for feature in features
        ],
        dtype=np.float32,
    )

    standardized = (
        raw_values - scaler_mean
    ) / scaler_scale

    tensor = torch.tensor(
        standardized,
        dtype=torch.float32,
    ).unsqueeze(0)

    with torch.no_grad():
        logits = model(tensor)

        probabilities = torch.softmax(
            logits,
            dim=1,
        )

        confidence, predicted_id = (
            torch.max(
                probabilities,
                dim=1,
            )
        )

    predicted_id = int(
        predicted_id.item()
    )

    prediction = id_to_class[
        predicted_id
    ]

    confidence = float(
        confidence.item() * 100
    )

    return (
        prediction,
        confidence,
        raw_values,
        standardized,
    )


def detect_distribution_shift(
    standardized,
):
    max_z = float(
        np.max(
            np.abs(standardized)
        )
    )

    if max_z >= 10:
        return "SEVERE"

    if max_z >= 5:
        return "HIGH"

    if max_z >= 3:
        return "MODERATE"

    return "LOW"


def save_prediction(record):
    (
        prediction,
        confidence,
        raw_values,
        standardized,
    ) = predict(record)

    shift = detect_distribution_shift(
        standardized
    )

    output = {
        "timestamp":
            record.get("timestamp"),

        "node":
            record.get(
                "node",
                "HOST-SENSOR-01",
            ),

        "mode":
            "SHADOW",

        "source":
            "REAL_TELEMETRY",

        "prediction":
            prediction,

        "confidence":
            round(
                confidence,
                2,
            ),

        "distribution_shift":
            shift,

        "features": {
            feature: record[feature]
            for feature in features
        },

        "standardized_features": {
            feature: round(
                float(value),
                3,
            )
            for feature, value in zip(
                features,
                standardized,
            )
        },

        "dashboard_alert":
            False,
    }

    with SHADOW_LOG.open(
        "a",
        encoding="utf-8",
    ) as file:

        file.write(
            json.dumps(output)
            + "\n"
        )

    print(
        f"[SHADOW] "
        f"{prediction:<12} "
        f"{confidence:6.2f}% | "
        f"SHIFT={shift}"
    )


def process_existing(
    processed,
):
    if not REAL_LOG.exists():
        return

    with REAL_LOG.open(
        "r",
        encoding="utf-8",
    ) as file:

        for line in file:

            try:
                record = json.loads(
                    line
                )

            except json.JSONDecodeError:
                continue

            timestamp = record.get(
                "timestamp"
            )

            if not timestamp:
                continue

            if timestamp in processed:
                continue

            if not validate_record(
                record
            ):
                continue

            save_prediction(record)

            processed.add(
                timestamp
            )


def follow_file(processed):
    while True:

        if not REAL_LOG.exists():
            print(
                "[WAIT] Waiting for "
                "real telemetry log..."
            )

            time.sleep(
                POLL_INTERVAL
            )

            continue

        with REAL_LOG.open(
            "r",
            encoding="utf-8",
        ) as file:

            file.seek(
                0,
                2,
            )

            while True:

                line = file.readline()

                if not line:
                    time.sleep(
                        POLL_INTERVAL
                    )
                    continue

                try:
                    record = json.loads(
                        line
                    )

                except json.JSONDecodeError:
                    continue

                timestamp = record.get(
                    "timestamp"
                )

                if not timestamp:
                    continue

                if timestamp in processed:
                    continue

                if not validate_record(
                    record
                ):
                    continue

                save_prediction(record)

                processed.add(
                    timestamp
                )


def main():
    processed = already_processed()

    print(
        f"[INFO] Previously processed: "
        f"{len(processed)} samples"
    )

    print(
        "[INFO] Processing existing "
        "real telemetry..."
    )

    process_existing(
        processed
    )

    print(
        "[INFO] Watching for new "
        "real telemetry..."
    )

    try:
        follow_file(
            processed
        )

    except KeyboardInterrupt:
        print()
        print(
            "[STOP] Shadow analyzer "
            "stopped safely."
        )


if __name__ == "__main__":
    main()
