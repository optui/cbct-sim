import { Component, OnInit, Input } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { SourceService } from '../../services/source.service';

@Component({
  standalone: true,
  selector: 'app-source-list',
  imports: [CommonModule, RouterModule, NgIf],
  template: `
    <div class="container py-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3 class="mb-0">Sources</h3>
        <button class="btn btn-primary" (click)="create()">+ New Source</button>
      </div>

      <div *ngIf="sources.length === 0" class="alert alert-warning text-center">
        No sources found
      </div>

      <ul class="list-group" *ngIf="sources.length > 0">
        <li *ngFor="let name of sources" class="list-group-item d-flex justify-content-between align-items-center">
          <span>{{ name }}</span>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-primary" (click)="edit(name)">Edit</button>
            <button class="btn btn-outline-danger" (click)="delete(name)">Delete</button>
          </div>
        </li>
      </ul>
    </div>
  `
})
export class SourceListComponent implements OnInit {
  simId!: number;
  sources: string[] = [];
  loading = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private svc: SourceService
  ) {}

  ngOnInit(): void {
    this.simId = Number(this.route.parent?.snapshot.paramMap.get('id') || 
                        this.route.snapshot.paramMap.get('simId'));
    this.load();
  }

  load(): void {
    this.loading = true;
    this.svc.list(this.simId).subscribe({
      next: (list) => {
        this.sources = list;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  create(): void {
    this.router.navigate([`/simulations/${this.simId}/sources/create`]);
  }

  edit(name: string): void {
    this.router.navigate(['sources', encodeURIComponent(name), 'edit'], { relativeTo: this.route.parent });
  }

  delete(name: string): void {
    if (!confirm('Delete this source?')) { return; }
    this.svc.delete(this.simId, name)
      .subscribe(() => this.load());
  }
}