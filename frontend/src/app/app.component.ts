// app.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './components/shared/nav/nav.component';
import { SimulationService } from './services/simulation.service';
import { Simulation } from './models/simulation';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavComponent, CommonModule],
  template: `
    <main>
      <app-nav [simulations]="(simulations$ | async) || []" />
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
export class AppComponent implements OnInit {
  private simulationService = inject(SimulationService);

  simulations$: Observable<Simulation[]>;

  constructor() {
    this.simulations$ = this.simulationService.simulations$;
  }

  ngOnInit(): void {
    this.loadSimulations();    
  }

  loadSimulations(): void {
    this.simulationService.getSimulations().subscribe({
      error: err => console.error('Error fetching simulations:', err),
    });
  }
}