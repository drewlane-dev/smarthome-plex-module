# Smarthome Plex Module

## Overview
Plex Media Server module for the smarthome system. Contains both the Angular MFE UI and Kubernetes deployment configurations.

## Module Structure

### /config
Configuration files read by smarthome-management-api during installation:

- **mfe-manifest.json**: Defines how the MFE integrates with the shell (tile icon, color, exposed component)
- **module-fields.json**: Form fields for user configuration (claim token, media paths)
- **mfe-deployment.yaml**: K8s Deployment + Service for the Angular MFE container
- **service-template.yaml**: K8s Deployment + Service for Plex Media Server

### /plex-ui
Angular 19 micro-frontend application:

- **Framework**: Angular 19 standalone components
- **Federation**: @angular-architects/native-federation
- **Port**: 4203 (dev)
- **Exposed component**: `PlexComponent` via `./Component`

## Key Files

```
plex-ui/
├── federation.config.js           # Exposes PlexComponent
├── src/
│   ├── app/
│   │   ├── plex/
│   │   │   └── plex.component.ts  # Main UI component
│   │   └── services/
│   │       └── plex.service.ts    # API integration
│   └── bootstrap.ts
└── Dockerfile                     # Multi-stage nginx build
```

## Plex Server Configuration

The service-template.yaml deploys Plex with:
- **hostNetwork: true**: For DLNA/discovery
- **4GB RAM limit**: Plex needs resources for transcoding
- **Three volume mounts**:
  - `/config` - Plex database and settings
  - `/media` - Your media library
  - `/transcode` - Temporary transcode files

Template placeholders:
- `{{claimToken}}` - Links server to Plex account (get from plex.tv/claim)
- `{{mediaPath}}` - Host path to media files
- `{{configPath}}` - Host path for Plex config
- `{{transcodePath}}` - Host path for transcode temp files

## Development

```bash
cd plex-ui
npm install
npm start  # http://localhost:4203
```

## Docker Build

```bash
cd plex-ui
docker build -t plex-mfe:latest .

# For ARM64 (Raspberry Pi)
docker buildx build --platform linux/arm64 -t plex-mfe:latest .
```

## First-Time Plex Setup

1. Get claim token from https://plex.tv/claim (valid 4 minutes)
2. Deploy module with token and paths configured
3. Open Plex web UI from the module interface
4. Complete setup wizard and add media libraries
5. Subsequent restarts don't need the claim token
