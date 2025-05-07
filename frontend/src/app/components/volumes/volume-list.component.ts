// volume-list.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { VolumeService } from '../../services/volume.service';

@Component({
  selector: 'app-volume-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <h3>Volumes (sim {{ simulationId }})</h3>
    <button (click)="create()">+ New Volume</button>
    <ul>
      <li *ngFor="let name of volumes">
        {{ name }}
        <button (click)="view(name)">View</button>
        <button (click)="edit(name)">Edit</button>
        <button (click)="delete(name)">Delete</button>
      </li>
    </ul>
  `
})
export class VolumeListComponent implements OnInit {
  @Input() simulationId!: number;
  volumes: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private svc: VolumeService
  ) {}

  ngOnInit(): void {
    // if parent template didn’t pass an @Input(), fall back to the URL
    if (!this.simulationId) {
      this.simulationId = Number(
        this.route.parent!.snapshot.paramMap.get('id')
      );
    }
    this.loadVolumes();
  }

  loadVolumes() {
    this.svc.list(this.simulationId).subscribe(v => (this.volumes = v));
  }
  view(name: string) {
    this.router.navigate(['volumes', name], { relativeTo: this.route });
  }
  edit(name: string) {
    this.router.navigate(['volumes', name, 'edit'], {
      relativeTo: this.route,
    });
  }
  delete(name: string) {
    if (!confirm(`Delete volume "${name}"?`)) return;
    this.svc.delete(this.simulationId, name).subscribe(() => this.loadVolumes());
  }
  create() {
    this.router.navigate(['volumes', 'create'], { relativeTo: this.route });
  }
}
