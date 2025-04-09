import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './components/shared/nav/nav.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavComponent, CommonModule],
  template: `
    <main>
      <app-nav />
      <router-outlet />
    </main>
  `,
  styles: `
    main {
      height: 100%;
      width: 100%;
      display: flex;
      flex-flow: row nowrap;
    }
  `,
})
export class AppComponent {}