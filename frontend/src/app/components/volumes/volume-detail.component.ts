import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { VolumeService } from '../../services/volume.service';
import { VolumeRead, VolumeType, BoxShape, SphereShape } from '../../interfaces/volume';
import { Unit } from '../../interfaces/primitives';

@Component({
  selector: 'app-volume-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container py-5" *ngIf="volume as vol; else loading">
      <div class="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h1 class="fw-bold display-6 mb-0">{{ vol.name }}</h1>
          <p class="text-muted">Volume Details</p>
        </div>
        <button class="btn btn-secondary btn-sm" (click)="back()">
          <i class="bi bi-arrow-left me-1"></i> Back
        </button>
      </div>

      <div class="card shadow-sm">
        <div class="card-body px-5 py-4">
          <dl class="row mb-0">
            <dt class="col-sm-3">Material</dt>
            <dd class="col-sm-9">{{ vol.material }}</dd>

            <dt class="col-sm-3">Mother</dt>
            <dd class="col-sm-9">{{ vol.mother }}</dd>

            <dt class="col-sm-3">Translation</dt>
            <dd class="col-sm-9">
              {{ vol.translation.join(' × ') }} ({{ vol.translation_unit }})
            </dd>

            <dt class="col-sm-3">Rotation</dt>
            <dd class="col-sm-9">
              {{ vol.rotation.axis }}: {{ vol.rotation.angle }}°
            </dd>

            <dt class="col-sm-3">Shape</dt>
            <dd class="col-sm-9">{{ vol.shape.type }} ({{ vol.shape.unit }})</dd>

            <ng-container *ngIf="isBox">
              <dt class="col-sm-3">Box Size</dt>
              <dd class="col-sm-9">{{ boxShape?.size?.join(' × ') }}</dd>
            </ng-container>

            <ng-container *ngIf="isSphere">
              <dt class="col-sm-3">Inner Radius (rmin)</dt>
              <dd class="col-sm-9">{{ sphereShape?.rmin }}</dd>

              <dt class="col-sm-3">Outer Radius (rmax)</dt>
              <dd class="col-sm-9">{{ sphereShape?.rmax }}</dd>
            </ng-container>


            <dt class="col-sm-3">Dynamic?</dt>
            <dd class="col-sm-9">{{ vol.dynamic_params.enabled ? 'Yes' : 'No' }}</dd>
          </dl>
        </div>
      </div>
    </div>

    <ng-template #loading>
      <div class="container py-5 text-center text-muted">
        <div class="spinner-border text-primary mb-3" role="status"></div>
        <div>Loading volume details…</div>
      </div>
    </ng-template>
  `
})
export class VolumeDetailComponent implements OnInit {
  volume: VolumeRead | null = null;
  simulationId!: number;
  volumeName!: string;

  private readonly volumeService = inject(VolumeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.simulationId = Number(this.route.snapshot.paramMap.get('simId'));
    this.volumeName = this.route.snapshot.paramMap.get('name')!;

    this.volumeService.getVolume(this.simulationId, this.volumeName).subscribe(data => {
      this.volume = data;
    });
  }

  back(): void {
    this.router.navigate(['/simulations', this.simulationId]);
  }

  get isBox(): boolean {
    return this.volume?.shape.type === VolumeType.BOX;
  }

  get isSphere(): boolean {
    return this.volume?.shape.type === VolumeType.SPHERE;
  }

  get boxShape(): BoxShape | null {
  return this.isBox ? this.volume!.shape as BoxShape : null;
  }

  get sphereShape(): SphereShape | null {
    return this.isSphere ? this.volume!.shape as SphereShape : null;
  }
}
