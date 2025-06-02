import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { VolumeService } from '../../services/volume.service';
import { VolumeRead, VolumeType, BoxShape, SphereShape } from '../../interfaces/volume';

@Component({
  selector: 'app-volume-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: `volume-detail.component.html`
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
