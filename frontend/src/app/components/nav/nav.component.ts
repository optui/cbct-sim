import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-nav',
  imports: [RouterLink],
  template: `
    <nav class="container">
      <ul>
        <li>
          <h2>
            <a [routerLink]="['/']">ProjeCT</a>
          </h2>
        </li>
      </ul>
      <ul>
        <li><a [routerLink]="['/simulations']">Simulations</a></li>
        <li>
          <button (click)="toggleTheme()">
            {{ theme === 'dark' ? 'Light' : 'Dark' }} mode
          </button>
        </li>
      </ul>
    </nav>
  `,
  styles: `
    li h2 {
      margin: 0
    }
  `
})
export class NavComponent {
  theme: 'light' | 'dark' = 'dark';

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', this.theme);
  }
}
