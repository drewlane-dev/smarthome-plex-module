# Smarthome Plex Module

Plex Media Server module for the smarthome system. Stream your personal media collection from anywhere.

## Structure

```
smarthome-plex-module/
├── config/
│   ├── mfe-manifest.json      # MFE configuration for shell
│   ├── module-fields.json     # Configuration form fields
│   ├── mfe-deployment.yaml    # K8s deployment for UI
│   └── service-template.yaml  # K8s deployment for Plex server
└── plex-ui/                   # Angular MFE application
    ├── src/
    ├── Dockerfile
    └── package.json
```

## Configuration Fields

| Field | Type | Description |
|-------|------|-------------|
| deployService | select | Whether to deploy Plex server container |
| claimToken | text | Plex claim token from https://plex.tv/claim |
| mediaPath | text | Host path to media files |
| configPath | text | Host path for Plex configuration |
| transcodePath | text | Host path for transcode temp files |

## Development

### Prerequisites
- Node.js 20+
- smarthome-management-api running on port 5000

### Run locally
```bash
cd plex-ui
npm install
npm start  # Runs on localhost:4203
```

## Deployment

The module is deployed via the smarthome-management-api:

1. Install the module from the shell UI
2. Get a claim token from https://plex.tv/claim (valid 4 minutes)
3. Configure media paths
4. The API deploys both the MFE and Plex server to K8s

### Manual Docker build
```bash
cd plex-ui
docker build -t plex-mfe:latest .
```

## First-Time Setup

1. Deploy the module with a valid claim token
2. Open the Plex web interface (button in UI)
3. Complete Plex setup wizard
4. Add your media libraries

## Requirements

- Smarthome system with the management API running
- Kubernetes cluster with sufficient resources (4GB RAM recommended)
- Media files accessible from the K8s node
- Plex account (free or Plex Pass)

## Related Repositories

- [smarthome-shell-ui](https://github.com/drewlane-dev/smarthome-shell-ui) - Shell application
- [smarthome-management-api](https://github.com/drewlane-dev/smarthome-management-api) - Backend API
