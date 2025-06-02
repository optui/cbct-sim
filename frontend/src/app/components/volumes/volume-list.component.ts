import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { VolumeService } from '../../services/volume.service';

@Component({
  selector: 'app-volume-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: `volume-list.component.html`,
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
