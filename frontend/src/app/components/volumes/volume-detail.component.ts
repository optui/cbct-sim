import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { VolumeService } from '../../services/volume.service';
import { VolumeRead, BoxShape, SphereShape, VolumeShape } from '../../interfaces/volume';

@Component({
  selector: 'app-volume-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-4">
      <button class="btn btn-outline-secondary mb-3" (click)="back()">← Back to volumes</button>

      <div *ngIf="volume; else loading" class="card">
        <div class="card-body">
          <h4 class="card-title">Volume: {{ volume.name }}</h4>
          <ul class="list-group list-group-flush">
            <li class="list-group-item"><strong>Mother:</strong> {{ volume.mother || 'None' }}</li>
            <li class="list-group-item"><strong>Type:</strong> {{ volume.shape.type }}</li>
            <li class="list-group-item"><strong>Material:</strong> {{ volume.material }}</li>
            <li class="list-group-item"><strong>Translation:</strong>
              {{ volume.translation[0] }}, {{ volume.translation[1] }}, {{ volume.translation[2] }}
              {{ volume.translation_unit }}
            </li>
            <li class="list-group-item"><strong>Rotation:</strong>
              axis = {{ volume.rotation.axis }},
              angle = {{ volume.rotation.angle }}°
            </li>
            <li *ngIf="volume.shape.type === 'Box'" class="list-group-item">
              <ng-container *ngIf="getBoxShape(volume.shape) as box">
                <strong>Size:</strong>
                {{ box.size[0] }} × {{ box.size[1] }} × {{ box.size[2] }} {{ box.unit }}
              </ng-container>
            </li>
            <li *ngIf="volume.shape.type === 'Sphere'" class="list-group-item">
              <ng-container *ngIf="getSphereShape(volume.shape) as sphere">
                <strong>Inner Radius:</strong> {{ sphere.rmin }} {{ sphere.unit }}<br />
                <strong>Outer Radius:</strong> {{ sphere.rmax }} {{ sphere.unit }}
              </ng-container>
            </li>
          </ul>

          <div *ngIf="volume.dynamic_params.enabled" class="mt-3">
            <h5>Dynamic Parameters</h5>
            <p *ngIf="volume.dynamic_params.translation_end">
              <strong>End Translation:</strong>
              {{ volume.dynamic_params.translation_end[0] }},
              {{ volume.dynamic_params.translation_end[1] }},
              {{ volume.dynamic_params.translation_end[2] }}
              {{ volume.translation_unit }}
            </p>
            <p *ngIf="volume.dynamic_params.angle_end">
              <strong>End Angle:</strong> {{ volume.dynamic_params.angle_end }}°
            </p>
          </div>

          <div class="mt-4 d-flex gap-2">
            <button class="btn btn-primary" (click)="edit()">Edit</button>
            <button class="btn btn-outline-secondary" (click)="back()">← Back</button>
          </div>
        </div>
      </div>

      <ng-template #loading>
        <div class="alert alert-info">Loading volume details…</div>
      </ng-template>
    </div>
  `
})
export class VolumeDetailComponent implements OnInit {
  simulationId!: number;
  volumeName!: string;
  volume?: VolumeRead;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private volumeService: VolumeService
  ) {}

  ngOnInit(): void {
    this.simulationId = Number(this.route.parent?.snapshot.paramMap.get('id') || 
                               this.route.snapshot.paramMap.get('simId'));
    this.volumeName = this.route.snapshot.paramMap.get('name') || 
                      this.route.snapshot.paramMap.get('volumeName')!;
    this.volumeService.get(this.simulationId, this.volumeName)
      .subscribe(v => this.volume = v);
  }

  getBoxShape(shape: VolumeShape): BoxShape | null {
    return shape.type === 'Box' ? shape as BoxShape : null;
  }

  getSphereShape(shape: VolumeShape): SphereShape | null {
    return shape.type === 'Sphere' ? shape as SphereShape : null;
  }

  edit() {
    this.router.navigate([`/simulations/${this.simulationId}/volumes/${this.volumeName}/edit`]);
  }

  back() {
    this.router.navigate([`/simulations/${this.simulationId}/volumes`]);
  }
}
