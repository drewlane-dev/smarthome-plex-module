import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlexService, ModuleStatus, ModuleDefinition, ModuleField, FieldOption } from '../services/plex.service';

@Component({
  selector: 'app-plex',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './plex.component.html',
  styleUrl: './plex.component.scss'
})
export class PlexComponent implements OnInit, OnDestroy {
  moduleDefinition: ModuleDefinition | null = null;
  moduleStatus: ModuleStatus | null = null;
  fieldValues: Record<string, string> = {};
  loading = false;
  error = '';
  waitingForService = false;
  serviceStatusMessage = '';

  constructor(private plexService: PlexService) {}

  ngOnInit(): void {
    this.loadModuleInfo();
  }

  ngOnDestroy(): void {}

  loadModuleInfo(): void {
    this.loading = true;

    this.plexService.getModuleDefinition().subscribe({
      next: (definition) => {
        this.moduleDefinition = definition;

        for (const field of definition.fields) {
          this.fieldValues[field.name] = field.defaultValue || '';
        }

        this.loadStatus();
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to load module definition';
      }
    });
  }

  loadStatus(): void {
    this.plexService.getStatus().subscribe({
      next: (status) => {
        this.moduleStatus = status;
        this.loading = false;

        if (status.isDeployed && status.fieldValues) {
          this.fieldValues = { ...this.fieldValues, ...status.fieldValues };
        }
      },
      error: () => {
        this.moduleStatus = null;
        this.loading = false;
      }
    });
  }

  deploy(): void {
    this.loading = true;
    this.error = '';

    this.plexService.deploy(this.fieldValues).subscribe({
      next: (status) => {
        this.moduleStatus = status;
        if (!status.serviceDeployed && status.message?.includes('skipped')) {
          this.loading = false;
        } else if (!status.serviceDeployed) {
          this.loading = false;
          this.error = status.message || 'Failed to deploy service';
        } else {
          this.waitingForService = true;
          this.serviceStatusMessage = 'Starting Plex server...';
          this.pollServiceReady();
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to deploy module';
      }
    });
  }

  private pollServiceReady(attempts = 0): void {
    const maxAttempts = 60;
    const pollInterval = 2000;

    if (attempts >= maxAttempts) {
      this.loading = false;
      this.waitingForService = false;
      this.error = 'Server startup timed out. Check the status and try again.';
      return;
    }

    this.plexService.checkServiceReady().subscribe({
      next: (response) => {
        this.serviceStatusMessage = response.podStatus
          ? `Pod status: ${response.podStatus}`
          : 'Waiting for pod...';

        if (response.ready && response.nodePort) {
          if (this.moduleStatus) {
            this.moduleStatus.serviceRunning = true;
            this.moduleStatus.serviceNodePort = response.nodePort;
            this.moduleStatus.podStatus = response.podStatus;
          }
          this.loading = false;
          this.waitingForService = false;
        } else {
          setTimeout(() => this.pollServiceReady(attempts + 1), pollInterval);
        }
      },
      error: () => {
        setTimeout(() => this.pollServiceReady(attempts + 1), pollInterval);
      }
    });
  }

  remove(): void {
    this.loading = true;
    this.error = '';

    this.plexService.remove().subscribe({
      next: () => {
        this.moduleStatus = {
          moduleName: 'plex',
          isDeployed: false,
          isRunning: false,
          serviceDeployed: false,
          serviceRunning: false
        };
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to remove module';
      }
    });
  }

  getOptionValue(option: string | FieldOption): string {
    return typeof option === 'string' ? option : option.value;
  }

  getOptionLabel(option: string | FieldOption): string {
    return typeof option === 'string' ? option : option.label;
  }

  getFieldDisplayValue(field: ModuleField, value: string): string {
    if (field.options) {
      const option = field.options.find(o =>
        (typeof o === 'string' ? o : o.value) === value
      );
      if (option) {
        return typeof option === 'string' ? option : option.label;
      }
    }
    return value;
  }

  getPlexUrl(): string {
    const host = window.location.hostname;
    const port = this.moduleStatus?.serviceNodePort || 32400;
    return `http://${host}:${port}/web`;
  }

  openPlex(): void {
    window.open(this.getPlexUrl(), '_blank');
  }
}
