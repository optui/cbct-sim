import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { VolumeService } from '../../services/volume.service';

@Component({
  selector: 'app-volume-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div *ngIf="volumes.length > 0; else noVolumes">
      <div class="card mb-3 shadow-sm" *ngFor="let vol of volumes">
        <div class="card-body d-flex justify-content-between align-items-center">
          <div>
            <h5 class="mb-1">{{ vol }}</h5>
          </div>

          <div class="d-flex gap-2">
            <!-- 🔍 Detail -->
            <button class="btn btn-outline-secondary btn-sm"
              [routerLink]="['/simulations', simulationId, 'volumes', vol]"
              title="Details">
              <i class="bi bi-info-circle"></i>
            </button>

            <!-- ✏️ Edit -->
            <button class="btn btn-outline-primary btn-sm"
              [routerLink]="['/simulations', simulationId, 'volumes', vol, 'edit']"
              title="Edit">
              <i class="bi bi-pencil"></i>
            </button>

            <!-- ❌ Delete -->
            <button class="btn btn-outline-danger btn-sm"
              (click)="deleteVolume(vol)"
              title="Delete">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <ng-template #noVolumes>
      <div class="alert alert-light text-muted">
        <i class="bi bi-inbox me-2"></i> No volumes defined for this simulation yet.
      </div>
    </ng-template>

    <!-- ➕ Add Volume -->
    <button class="btn btn-sm btn-primary mt-3"
      [routerLink]="['/simulations', simulationId, 'volumes', 'new']">
      <i class="bi bi-plus-circle me-1"></i> Add Volume
    </button>
  `,
})
export class VolumeListComponent implements OnInit {
  @Input() simulationId!: number;
  volumes: string[] = [];
  private volumeService = inject(VolumeService);

  ngOnInit(): void {
    this.volumeService.getVolumes(this.simulationId).subscribe({
      next: (data) => (this.volumes = data),
      error: (err) => {
        console.error('Error loading volumes:', err);
        this.volumes = [];
      }
    });
  }

  deleteVolume(name: string): void {
    if (!confirm(`Delete volume "${name}"?`)) return;

    this.volumeService.deleteVolume(this.simulationId, name).subscribe({
      next: () => {
        this.volumes = this.volumes.filter((v) => v !== name);
      },
      error: (err) => {
        alert(`Failed to delete volume: ${err.message || err}`);
      }
    });
  }
}
