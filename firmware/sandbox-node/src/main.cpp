#include <Arduino.h>
#include <ESP8266WiFi.h>
#include "secrets.h"

unsigned long lastHeartbeat = 0;
unsigned long lastFeatures = 0;
int profile = 0;

void sendHeartbeat() {
    Serial.println(
        "{\"node\":\"SANDBOX-01\","
        "\"type\":\"HEARTBEAT\","
        "\"status\":\"OK\"}"
    );
}

void sendFeaturePacket() {

    profile = (profile + 1) % 3;

    int authFailures;
    int uniquePorts;
    float connectionRate;
    float packetRate;
    int bytesOut;

    if (profile == 0) {
        // normal-like behavior
        authFailures = 0;
        uniquePorts = 2;
        connectionRate = 2.5;
        packetRate = 15.0;
        bytesOut = 1200;
    }

    else if (profile == 1) {
        // credential-attack-like behavior
        authFailures = 18;
        uniquePorts = 2;
        connectionRate = 14.5;
        packetRate = 70.0;
        bytesOut = 2600;
    }

    else {
        // scanning-like behavior
        authFailures = 1;
        uniquePorts = 28;
        connectionRate = 35.0;
        packetRate = 150.0;
        bytesOut = 5200;
    }

    Serial.print("{");
    Serial.print("\"node\":\"SANDBOX-01\",");
    Serial.print("\"type\":\"FEATURES\",");
    Serial.print("\"auth_failures\":");
    Serial.print(authFailures);
    Serial.print(",");
    Serial.print("\"unique_ports\":");
    Serial.print(uniquePorts);
    Serial.print(",");
    Serial.print("\"connection_rate\":");
    Serial.print(connectionRate);
    Serial.print(",");
    Serial.print("\"packet_rate\":");
    Serial.print(packetRate);
    Serial.print(",");
    Serial.print("\"bytes_out\":");
    Serial.print(bytesOut);
    Serial.println("}");
}

void setup() {

    Serial.begin(115200);
    delay(1500);

    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    Serial.print("Connecting");

    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }

    Serial.println();
    Serial.println("[OK] SANDBOX CONNECTED");

    Serial.print("IP: ");
    Serial.println(WiFi.localIP());

    Serial.println("FEATURE ENGINE: ACTIVE");
}

void loop() {

    unsigned long now = millis();

    if (now - lastHeartbeat >= 5000) {
        lastHeartbeat = now;
        sendHeartbeat();
    }

    if (now - lastFeatures >= 10000) {
        lastFeatures = now;
        sendFeaturePacket();
    }
}
