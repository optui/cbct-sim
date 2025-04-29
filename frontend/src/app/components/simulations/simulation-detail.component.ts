import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SimulationService } from '../../services/simulation.service';
import { SimulationRead, SimulationUpdate } from '../../interfaces/simulation';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-simulation-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div *ngIf="simulation() as sim">
      <h2>Edit Simulation</h2>
      <form (ngSubmit)="save()">
        <label>
          Name:
          <input [(ngModel)]="sim.name" name="name" required />
        </label>
        <label>
          Number of Runs:
          <input type="number" [(ngModel)]="sim.num_runs" name="num_runs" required />
        </label>
        <label>
          Run Length:
          <input type="number" [(ngModel)]="sim.run_len" name="run_len" required />
        </label>

        <button type="submit">Save</button>
      </form>
    </div>

    <p *ngIf="!simulation()">Loading...</p>
  `
})
export class SimulationDetailComponent implements OnInit {
  simulation = signal<SimulationRead | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private svc: SimulationService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.svc.get(id).subscribe(data => this.simulation.set(data));
  }

  save() {
    if (!this.simulation()) return;

    const id = this.simulation()!.id;
    const payload: SimulationUpdate = {
      name: this.simulation()!.name,
      num_runs: this.simulation()!.num_runs,
      run_len: this.simulation()!.run_len,
    };

    this.svc.update(id, payload).subscribe(() => {
      alert('Simulation updated successfully!');
      this.router.navigate(['/simulations']);
    });
  }
}
