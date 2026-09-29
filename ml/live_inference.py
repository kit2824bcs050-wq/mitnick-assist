import json
from datetime import datetime
from pathlib import Path

import numpy as np
import serial
import torch
import torch.nn as nn


MODEL_FILE = Path("ml/models/mitnick_dnn.pt")
LOG_FILE = Path("ml/logs/live_predictions.jsonl")

SERIAL_PORT = "/dev/ttyUSB0"
BAUD_RATE = 115200

ALLOWED_NODE = "SANDBOX-01"


class MitnickDNN(nn.Module):

    def __init__(self):
        super().__init__()

        self.network = nn.Sequential(
            nn.Linear(5, 32),
            nn.ReLU(),

            nn.Dropout(0.20),

            nn.Linear(32, 16),
            nn.ReLU(),

            nn.Dropout(0.10),

            nn.Linear(16, 3),
        )

    def forward(self, x):
        return self.network(x)


checkpoint = torch.load(
    MODEL_FILE,
    map_location="cpu",
)

FEATURES = checkpoint["features"]
CLASS_TO_ID = checkpoint["class_to_id"]

ID_TO_CLASS = {
    value: key
    for key, value in CLASS_TO_ID.items()
}

SCALER_MEAN = np.array(
    checkpoint["scaler_mean"],
    dtype=np.float32,
)

SCALER_SCALE = np.array(
    checkpoint["scaler_scale"],
    dtype=np.float32,
)


model = MitnickDNN()

model.load_state_dict(
    checkpoint["model_state"]
)

model.eval()


def validate_features(data):

    if data.get("node") != ALLOWED_NODE:
        return False

    if data.get("type") != "FEATURES":
        return False

    for feature in FEATURES:

        if feature not in data:
            return False

        value = data[feature]

        if not isinstance(
            value,
            (int, float),
        ):
            return False

    return True


def predict(data):

    values = np.array(
        [
            float(data[name])
            for name in FEATURES
        ],
        dtype=np.float32,
    )

    scaled = (
        values - SCALER_MEAN
    ) / SCALER_SCALE

    tensor = torch.tensor(
        scaled,
        dtype=torch.float32,
    ).unsqueeze(0)

    with torch.no_grad():

        logits = model(tensor)

        probabilities = torch.softmax(
            logits,
            dim=1,
        )

        confidence, prediction = torch.max(
            probabilities,
            dim=1,
        )

    class_id = prediction.item()

    return (
        ID_TO_CLASS[class_id],
        confidence.item(),
    )


def severity_for(prediction):

    if prediction == "NORMAL":
        return "LOW"

    if prediction == "BRUTE_FORCE":
        return "HIGH"

    if prediction == "PORT_SCAN":
        return "MEDIUM"

    return "UNKNOWN"


def save_prediction(
    data,
    prediction,
    confidence,
    severity,
):

    LOG_FILE.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    record = {
        "timestamp":
            datetime.now().isoformat(),

        "node":
            data["node"],

        "features": {
            feature: data[feature]
            for feature in FEATURES
        },

        "prediction":
            prediction,

        "confidence":
            round(confidence, 4),

        "severity":
            severity,
    }

    with LOG_FILE.open("a") as file:

        file.write(
            json.dumps(record)
            + "\n"
        )


def main():

    print("=" * 60)
    print("MITNICK ASSIST")
    print("LIVE DNN THREAT DETECTION")
    print("=" * 60)

    print(
        f"[MODEL] {MODEL_FILE}"
    )

    with serial.Serial(
        SERIAL_PORT,
        BAUD_RATE,
        timeout=1,
    ) as device:

        print(
            f"[OK] Listening on "
            f"{SERIAL_PORT}"
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

            if not raw.startswith("{"):
                continue

            try:

                data = json.loads(raw)

            except json.JSONDecodeError:
                continue

            if data.get(
                "type"
            ) == "HEARTBEAT":

                print(
                    "[HEARTBEAT] "
                    "SANDBOX-01 | OK"
                )

                continue

            if not validate_features(data):

                print(
                    "[REJECT] "
                    "Invalid feature packet"
                )

                continue

            prediction, confidence = predict(
                data
            )

            severity = severity_for(
                prediction
            )

            print(
                f"[DETECTION] "
                f"{prediction:<12} | "
                f"CONF={confidence * 100:6.2f}% | "
                f"SEVERITY={severity}"
            )

            save_prediction(
                data,
                prediction,
                confidence,
                severity,
            )


if __name__ == "__main__":

    try:

        main()

    except KeyboardInterrupt:

        print(
            "\n[STOP] "
            "MITNICK detection engine stopped."
        )
