import { Component } from '@angular/core';
import { PlexComponent } from './plex/plex.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PlexComponent],
  template: '<app-plex></app-plex>'
})
export class AppComponent {}
