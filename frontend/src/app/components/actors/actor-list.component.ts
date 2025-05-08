import { Component, OnInit, Input } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ActorService } from '../../services/actor.service';

@Component({
  standalone: true,
  selector: 'app-actor-list',
  imports: [CommonModule, RouterModule, NgIf],
  template: `
    <div class="section-container">
      <div class="section-header">
        <h3>Actors</h3>
        <button class="btn-create" (click)="create()">+ New Actor</button>
      </div>

      <div *ngIf="actors.length === 0" class="empty-state">
        No actors found
      </div>

      <ul class="item-list" *ngIf="actors.length > 0">
        <li *ngFor="let name of actors" class="item-card">
          <div class="item-name">{{ name }}</div>
          <div class="item-actions">
            <button class="btn-action" (click)="edit(name)">Edit</button>
            <button class="btn-action delete" (click)="delete(name)">Delete</button>
          </div>
        </li>
      </ul>
    </div>
  `,
  styles: [
    `.section-container { margin: 1.5rem 0; }
     .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
     .item-list { list-style: none; padding: 0; margin: 0; }
     .item-card { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border: 1px solid #eee; margin-bottom: 0.5rem; border-radius: 4px; }
     .item-actions { gap: 0.5rem; display: flex; }
     .btn-create { background: #4CAF50; color: white; border: none; padding: 0.5rem 1rem; }
     .btn-action { background: #f0f0f0; border: 1px solid #ddd; padding: 0.25rem 0.75rem; }
     .delete { color: #dc3545; }
     .empty-state { color: #666; padding: 1rem; text-align: center; }`
  ]
})
export class ActorListComponent implements OnInit {
  @Input() simulationId!: number;
  actors: string[] = [];
  loading = true;

  constructor(
    private svc: ActorService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.svc.list(this.simulationId).subscribe({
      next: (list) => {
        this.actors = list;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  create(): void {
    // Navigate relative to the parent route
    this.router.navigate(['actors', 'create'], { relativeTo: this.route.parent });
  }

  edit(name: string): void {
    this.router.navigate(['actors', encodeURIComponent(name), 'edit'], { relativeTo: this.route.parent });
  }

  delete(name: string): void {
    if (!confirm('Delete this actor?')) { return; }
    this.svc.delete(this.simulationId, name)
      .subscribe(() => this.load());
  }
}