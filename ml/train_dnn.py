import csv
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix


DATA_FILE = Path("ml/data/training.csv")
MODEL_FILE = Path("ml/models/mitnick_dnn.pt")

FEATURES = [
    "auth_failures",
    "unique_ports",
    "connection_rate",
    "packet_rate",
    "bytes_out",
]

CLASS_TO_ID = {
    "NORMAL": 0,
    "BRUTE_FORCE": 1,
    "PORT_SCAN": 2,
}

ID_TO_CLASS = {
    value: key
    for key, value in CLASS_TO_ID.items()
}


def load_dataset():
    x = []
    y = []

    with DATA_FILE.open() as file:
        reader = csv.DictReader(file)

        for row in reader:
            x.append([
                float(row[name])
                for name in FEATURES
            ])

            y.append(
                CLASS_TO_ID[row["label"]]
            )

    return (
        np.array(x, dtype=np.float32),
        np.array(y, dtype=np.int64),
    )


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


print("=" * 55)
print("MITNICK ASSIST")
print("DNN THREAT DETECTION TRAINING")
print("=" * 55)

X, y = load_dataset()

print(f"[OK] Loaded {len(X)} samples")

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y,
)

scaler = StandardScaler()

X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

X_train = torch.tensor(
    X_train,
    dtype=torch.float32,
)

X_test = torch.tensor(
    X_test,
    dtype=torch.float32,
)

y_train = torch.tensor(
    y_train,
    dtype=torch.long,
)

y_test_tensor = torch.tensor(
    y_test,
    dtype=torch.long,
)

model = MitnickDNN()

criterion = nn.CrossEntropyLoss()

optimizer = torch.optim.Adam(
    model.parameters(),
    lr=0.001,
)

EPOCHS = 200

for epoch in range(EPOCHS):

    model.train()

    optimizer.zero_grad()

    output = model(X_train)

    loss = criterion(
        output,
        y_train,
    )

    loss.backward()

    optimizer.step()

    if (
        epoch == 0
        or (epoch + 1) % 20 == 0
    ):
        print(
            f"Epoch "
            f"{epoch + 1:02d}/{EPOCHS} "
            f"| Loss={loss.item():.4f}"
        )


model.eval()

with torch.no_grad():

    logits = model(X_test)

    probabilities = torch.softmax(
        logits,
        dim=1,
    )

    predictions = torch.argmax(
        probabilities,
        dim=1,
    ).numpy()


accuracy = (
    predictions == y_test
).mean()

print()
print(
    f"[RESULT] Test Accuracy: "
    f"{accuracy * 100:.2f}%"
)

target_names = [
    ID_TO_CLASS[i]
    for i in range(3)
]

print()
print("Classification Report:")
print(
    classification_report(
        y_test,
        predictions,
        target_names=target_names,
    )
)

print("Confusion Matrix:")
print(
    confusion_matrix(
        y_test,
        predictions,
    )
)

MODEL_FILE.parent.mkdir(
    parents=True,
    exist_ok=True,
)

torch.save(
    {
        "model_state": model.state_dict(),

        "features": FEATURES,

        "class_to_id": CLASS_TO_ID,

        "scaler_mean":
            scaler.mean_.tolist(),

        "scaler_scale":
            scaler.scale_.tolist(),
    },
    MODEL_FILE,
)

print()
print(
    f"[OK] Model saved to "
    f"{MODEL_FILE}"
)
