// src/app/components/actor-detail/actor-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { RouterModule, Router, ActivatedRoute, RouterOutlet } from '@angular/router';
import { ActorService } from '../../services/actor.service';
import { ActorRead } from '../../interfaces/actor';

@Component({
  standalone: true,
  selector: 'app-actor-detail',
  imports: [CommonModule, NgIf, RouterModule, RouterOutlet],
  template: `
    <div *ngIf="actor; else loading">
      <h3>{{ actor.name }}</h3>
      <pre>{{ actor | json }}</pre>

      <button
        (click)="router.navigate(['create'], { relativeTo: route })">
        + New Actor
      </button>
      <button
        (click)="router.navigate(['edit'],   { relativeTo: route })">
        ✎ Edit Actor
      </button>
      <button (click)="back()">Back to Simulation</button>

      <!-- child routes render here -->
      <router-outlet></router-outlet>
    </div>
    <ng-template #loading><p>Loading…</p></ng-template>
  `
})
export class ActorDetailComponent implements OnInit {
  simulationId!: number;
  name!: string;
  actor?: ActorRead;

  constructor(
    public  router: Router,
    public  route: ActivatedRoute,
    private svc:   ActorService
  ) {}

  ngOnInit() {
    const params = this.route.snapshot.paramMap;
    this.simulationId = Number(params.get('id'));
    this.name         = params.get('name')!;
    this.svc.get(this.simulationId, this.name)
      .subscribe(a => (this.actor = a));
  }

  back() {
    this.router.navigate(['/simulations', this.simulationId]);
  }
}
