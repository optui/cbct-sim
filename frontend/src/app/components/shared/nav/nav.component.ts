import { Component, inject, OnInit, signal, Signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SimulationService } from '../../../services/simulation.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Simulation } from '../../../models/simulation';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterModule],
  templateUrl: 'nav.component.html',
  styleUrl: 'nav.component.scss'
})
export class NavComponent {
  private simulationService = inject(SimulationService);
  simulations: Signal<Simulation[]> = toSignal(this.simulationService.simulations(), {initialValue: []})
}