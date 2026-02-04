import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

declare global {
  interface Window {
    __API_URL__?: string;
  }
}

export interface ModuleStatus {
  moduleName: string;
  isDeployed: boolean;
  isRunning: boolean;
  serviceDeployed: boolean;
  serviceRunning: boolean;
  podStatus?: string;
  fieldValues?: Record<string, string>;
  serviceNodePort?: number;
  message?: string;
}

export interface ModuleDefinition {
  name: string;
  displayName: string;
  description?: string;
  fields: ModuleField[];
}

export interface ModuleField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description?: string;
  options?: string[] | FieldOption[];
}

export interface FieldOption {
  value: string;
  label: string;
}

export interface DeployRequest {
  fieldValues: Record<string, string>;
}

export interface ServiceReadyResponse {
  ready: boolean;
  podStatus?: string;
  nodePort?: number;
  message?: string;
}

function getApiUrl(): string {
  if (window.__API_URL__) {
    return window.__API_URL__;
  }
  return `${window.location.protocol}//${window.location.hostname}:5000`;
}

@Injectable({
  providedIn: 'root'
})
export class PlexService {
  private readonly moduleName = 'plex';
  private readonly apiUrl = `${getApiUrl()}/api/modules`;

  constructor(private http: HttpClient) {}

  getModuleDefinition(): Observable<ModuleDefinition> {
    return this.http.get<ModuleDefinition>(`${this.apiUrl}/${this.moduleName}`);
  }

  getStatus(): Observable<ModuleStatus> {
    return this.http.get<ModuleStatus>(`${this.apiUrl}/${this.moduleName}/status`);
  }

  deploy(fieldValues: Record<string, string>): Observable<ModuleStatus> {
    const request: DeployRequest = { fieldValues };
    return this.http.post<ModuleStatus>(`${this.apiUrl}/${this.moduleName}/configure`, request);
  }

  remove(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${this.moduleName}`);
  }

  checkServiceReady(): Observable<ServiceReadyResponse> {
    return this.http.get<ServiceReadyResponse>(`${this.apiUrl}/${this.moduleName}/service-ready`);
  }
}
