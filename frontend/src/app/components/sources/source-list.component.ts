import { Component, OnInit, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SourceService } from '../../services/source.service';

@Component({
  selector: 'app-source-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div *ngIf="sources.length > 0; else noSources">
      <div class="card mb-3 shadow-sm" *ngFor="let src of sources">
        <div class="card-body d-flex justify-content-between align-items-center">
          <div>
            <h5 class="mb-0">{{ src }}</h5>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-secondary btn-sm"
              [routerLink]="['/simulations', simulationId, 'sources', src]">
              <i class="bi bi-info-circle"></i>
            </button>

            <button class="btn btn-outline-primary btn-sm"
              [routerLink]="['/simulations', simulationId, 'sources', src, 'edit']">
              <i class="bi bi-pencil"></i>
            </button>

            <button class="btn btn-outline-danger btn-sm" (click)="deleteSource(src)">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <ng-template #noSources>
      <div class="alert alert-light text-muted">
        <i class="bi bi-inbox me-2"></i> No sources defined for this simulation.
      </div>
    </ng-template>

    <button class="btn btn-sm btn-primary mt-3"
      [routerLink]="['/simulations', simulationId, 'sources', 'new']">
      <i class="bi bi-plus-circle me-1"></i> Add Source
    </button>
  `
})
export class SourceListComponent implements OnInit {
  @Input() simulationId!: number;
  sources: string[] = [];

  private readonly sourceService = inject(SourceService);

  ngOnInit(): void {
    this.sourceService.getSources(this.simulationId).subscribe({
      next: (data) => (this.sources = data),
      error: (err) => {
        console.error('Failed to load sources:', err);
        this.sources = [];
      }
    });
  }

  deleteSource(name: string): void {
    if (!confirm(`Delete source "${name}"?`)) return;

    this.sourceService.deleteSource(this.simulationId, name).subscribe({
      next: () => {
        this.sources = this.sources.filter((s) => s !== name);
      },
      error: (err) => {
        alert(`Failed to delete source: ${err.message || err}`);
      }
    });
  }
}
