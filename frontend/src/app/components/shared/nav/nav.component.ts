import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule, NavigationEnd } from '@angular/router';
import { Simulation } from '../../../models/simulation';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav>
      <h1>ProjeCT</h1>
      <div id="simulations-header">
        <h2>Simulations</h2><span (click)="addSimulation()">+</span>
      </div>
      <ul>
        <li *ngFor="let simulation of simulations; trackBy: trackById"
            (click)="activate(simulation)"
            [class.active]="isActive(simulation)">
          {{ simulation.name }}
        </li>
      </ul>
    </nav>
  `,
  styleUrls: ['nav.component.scss']
})
export class NavComponent implements OnInit {
  @Input() simulations: Simulation[] = [];
  activeSimulationId = signal<number | null>(null);
  
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  ngOnInit(): void {
    // Listen to route changes to determine active simulation
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const urlSegments = this.router.url.split('/');
      
      // Clear active simulation when navigating to create page
      if (urlSegments.length >= 2 && urlSegments[1] === 'create') {
        this.activeSimulationId.set(null);
        return;
      }
      
      // Set active simulation when navigating to read page
      if (urlSegments.length >= 3 && urlSegments[1] === 'read') {
        const simId = Number(urlSegments[2]);
        if (!isNaN(simId)) {
          this.activeSimulationId.set(simId);
        }
      } else if (urlSegments[1] === '') {
        // Clear active simulation when on home page
        this.activeSimulationId.set(null);
      }
    });
  }

  isActive(simulation: Simulation): boolean {
    return simulation.id === this.activeSimulationId();
  }

  activate(simulation: Simulation): void {
    if (simulation.id === this.activeSimulationId()) {
      this.activeSimulationId.set(null);
      this.router.navigate(['']);
    } else {
      this.activeSimulationId.set(simulation.id);
      this.router.navigate(['read', simulation.id]);
    }
  }

  addSimulation(): void {
    this.activeSimulationId.set(null);
    this.router.navigate(['create']);
  }

  trackById(index: number, simulation: Simulation): number {
    return simulation.id;
  }
}