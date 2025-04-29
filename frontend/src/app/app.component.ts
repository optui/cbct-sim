import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavComponent } from './components/nav/nav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavComponent],
  template: `
    <app-nav></app-nav>

    <main class="container">
      <router-outlet />
    </main>


    <footer class="container">
      <p>&copy; ProjeCT 2025</p>
    </footer>

  `,
  styles: []
})
export class AppComponent {

}