// src/app/components/source-detail/source-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { RouterModule, Router, ActivatedRoute, RouterOutlet } from '@angular/router';
import { SourceService } from '../../services/source.service';
import { GenericSourceRead } from '../../interfaces/source';

@Component({
  standalone: true,
  selector: 'app-source-detail',
  imports: [CommonModule, NgIf, RouterModule, RouterOutlet],
  template: `
    <div *ngIf="source; else loading">
      <h3>{{ source.name }}</h3>
      <pre>{{ source | json }}</pre>

      <button
        (click)="router.navigate(['create'], { relativeTo: route })">
        + New Source
      </button>
      <button
        (click)="router.navigate(['edit'],   { relativeTo: route })">
        ✎ Edit Source
      </button>
      <button (click)="back()">Back to Simulation</button>

      <!-- child routes render here -->
      <router-outlet></router-outlet>
    </div>
    <ng-template #loading><p>Loading…</p></ng-template>
  `
})
export class SourceDetailComponent implements OnInit {
  simulationId!: number;
  name!: string;
  source?: GenericSourceRead;

  constructor(
    public  router: Router,
    public  route: ActivatedRoute,
    private svc:   SourceService
  ) {}

  ngOnInit() {
    const params = this.route.snapshot.paramMap;
    this.simulationId = Number(params.get('id'));
    this.name         = params.get('name')!;
    this.svc.get(this.simulationId, this.name)
      .subscribe(s => (this.source = s));
  }

  back() {
    this.router.navigate(['/simulations', this.simulationId]);
  }
}
