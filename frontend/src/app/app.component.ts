import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    SidebarComponent
  ],
  template: `
    <div class="layout-container">
      <app-sidebar class="sidebar"></app-sidebar>
      <div class="content">
        <!-- Displays whatever route we navigate to -->
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .layout-container {
      display: flex;           /* flex layout to put sidebar and content side by side */
      height: 100vh;
    }
    .content {
      flex: 1;
      overflow: auto;         /* scroll content if needed */
      background: #222;       /* background color for content area */
    }
  `]
})
export class AppComponent {}
