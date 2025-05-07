import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ActorService } from '../../services/actor.service';

@Component({
  standalone: true,
  selector: 'app-actor-list',
  imports: [CommonModule, RouterModule],
  template: `
    <button (click)="create()">+ New Actor</button>
    <ul>
      <li *ngFor="let name of actors">
        {{ name }}
        <button (click)="edit(name)">Edit</button>
        <button (click)="delete(name)">Delete</button>
      </li>
    </ul>
  `
})
export class ActorListComponent implements OnInit {
  @Input() simulationId!: number;
  actors: string[] = [];

  constructor(
    private svc: ActorService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.svc.list(this.simulationId)
      .subscribe(list => this.actors = list);
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