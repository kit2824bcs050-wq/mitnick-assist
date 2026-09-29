# MITNICK ASSIST

MITNICK ASSIST is a compartmentalized cyber-defense and SOC platform.

## Architecture

ESP8266 Sandbox
→ Security Telemetry
→ DNN Threat Detection
→ FastAPI Backend
→ RAG Knowledge Retrieval
→ Ollama GenAI SOC Investigation
→ React Dashboard

## Current Features

- ESP8266 sandbox telemetry
- DNN-based threat classification
- Real host telemetry sensor
- Shadow-mode real traffic analysis
- Distribution-shift monitoring
- FastAPI SOC backend
- React SOC dashboard
- RAG security knowledge base
- Local Ollama GenAI investigation
- Human-in-the-loop response recommendations

## Current Detection Classes

- NORMAL
- BRUTE_FORCE
- PORT_SCAN

## Project Status

The current DNN prototype was initially trained using synthetic behavioral telemetry.

Real host telemetry is currently being evaluated in shadow mode before enabling real-data production alerts.
