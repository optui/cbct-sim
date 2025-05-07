import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { VolumeService } from '../../services/volume.service';
import { VolumeRead } from '../../interfaces/volume';

@Component({
  selector: 'app-volume-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div *ngIf="volume; else loading">
    <h3>Volume: {{ volume.name }}</h3>
    <p><strong>Type:</strong> {{ volume.shape.type }}</p>
    <p><strong>Material:</strong> {{ volume.material }}</p>
    <p><strong>Translation:</strong> {{ volume.translation }}</p>
    <p>
      <strong>Rotation:</strong>
      axis = {{ volume.rotation.axis }},
      angle = {{ volume.rotation.angle }}
    </p>
    <div *ngIf="volume.shape.type === 'Box'">
      <p><strong>Size:</strong> {{ volume.shape.size }}</p>
    </div>
    <div *ngIf="volume.shape.type === 'Sphere'">
      <p><strong>Inner Radius:</strong> {{ volume.shape.rmin }}</p>
      <p><strong>Outer Radius:</strong> {{ volume.shape.rmax }}</p>
    </div>

    <button (click)="back()">← Back</button>
    </div>
    <ng-template #loading>
      <p>Loading volume details…</p>
    </ng-template>
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
    this.simulationId = Number(this.route.parent!.snapshot.paramMap.get('id'));
    this.volumeName = this.route.snapshot.paramMap.get('volumeName')!;
    this.volumeService
      .get(this.simulationId, this.volumeName)
      .subscribe(v => this.volume = v);
  }

  back() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
