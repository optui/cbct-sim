import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VolumeService } from '../../services/volume.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-volume-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <button class="btn btn-outline-secondary" (click)="back()">← Back to simulation</button>
        <button class="btn btn-primary" (click)="create()">+ New Volume</button>
      </div>

      <h3>Volumes</h3>

      <ul class="list-group mb-3" *ngIf="volumes.length > 0">
        <li *ngFor="let name of volumes" class="list-group-item d-flex justify-content-between align-items-center">
          <span>{{ name }}</span>
          <div class="btn-group btn-group-sm" role="group">
            <button class="btn btn-outline-primary" (click)="view(name)">View</button>
            <button class="btn btn-outline-secondary" (click)="edit(name)">Edit</button>
            <button class="btn btn-outline-danger" (click)="delete(name)">Delete</button>
          </div>
        </li>
      </ul>

      <div *ngIf="volumes.length === 0" class="alert alert-warning text-center">
        No volumes found. Create one!
      </div>
    </div>
  `
})
export class VolumeListComponent implements OnInit {
  simId!: number;
  volumes: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private svc: VolumeService
  ) {}

  ngOnInit(): void {
    this.simId = Number(this.route.parent?.snapshot.paramMap.get('id') || 
                        this.route.snapshot.paramMap.get('simId'));
    this.loadVolumes();
  }

  loadVolumes() {
    this.svc.list(this.simId).subscribe(v => this.volumes = v);
  }

  view(name: string) {
    this.router.navigate([`/simulations/${this.simId}/volumes/${name}`]);
  }

  edit(name: string) {
    this.router.navigate([`/simulations/${this.simId}/volumes/${name}/edit`]);
  }

  delete(name: string) {
    if (!confirm(`Delete volume "${name}"?`)) return;
    this.svc.delete(this.simId, name).subscribe(() => this.loadVolumes());
  }

  create() {
    this.router.navigate([`/simulations/${this.simId}/volumes/create`]);
  }

  back(): void {
    this.router.navigate(['/simulations', this.simId]);
  }
}
