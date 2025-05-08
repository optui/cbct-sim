// src/app/components/actor-detail/actor-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { RouterModule, Router, ActivatedRoute, RouterOutlet } from '@angular/router';
import { ActorService } from '../../services/actor.service';
import { ActorRead } from '../../interfaces/actor';

@Component({
  standalone: true,
  selector: 'app-actor-detail',
  imports: [CommonModule, NgIf, RouterModule],
  template: `

    <div *ngIf="actor; else loading">
      <h3>{{ actor.name }}</h3>
      <div *ngIf="actor.type === 'SimulationStatisticsActor'">
        <p>Output Filename: {{ actor.output_filename }}</p>
      </div>
      <div *ngIf="actor.type === 'DigitizerHitsCollectionActor'">
        <p>Attached To: {{ actor.attached_to }}</p>
        <p>Attributes: {{ actor.attributes?.join(', ') }}</p>
        <p>Output Filename: {{ actor.output_filename }}</p>
      </div>
      <div *ngIf="actor.type === 'DigitizerProjectionActor'">
        <p>Attached To: {{ actor.attached_to }}</p>
        <p>Input Digi Collections: {{ actor.input_digi_collections.join(', ') }}</p>
        <p>Spacing: {{ actor.spacing.join(', ') }}</p>
        <p>Size: {{ actor.size.join(', ') }}</p>
        <p>Origin as Image Center: {{ actor.origin_as_image_center }}</p>
        <p>Output Filename: {{ actor.output_filename }}</p>
      </div>
      <button
        (click)="router.navigate(['create'], { relativeTo: route })">
        + New Actor
      </button>
      <button
        (click)="router.navigate(['edit'],   { relativeTo: route })">
        ✎ Edit Actor
      </button>
      <button (click)="back()">Back to Simulation</button>
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
