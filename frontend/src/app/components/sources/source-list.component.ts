import { Component, OnInit, Input, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { SourceService } from '../../services/source.service';

@Component({
  standalone: true,
  selector: 'app-source-list',
  imports: [CommonModule, RouterModule],
  template: `
    <button (click)="create()">+ New Source</button>
    <ul>
      <li *ngFor="let name of sources">
        {{ name }}
        <button (click)="edit(name)">Edit</button>
        <button (click)="delete(name)">Delete</button>
      </li>
    </ul>
  `
})
export class SourceListComponent implements OnInit {
  @Input() simulationId!: number;
  sources: string[] = [];
  private svc = Inject(SourceService)

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.svc.list(this.simulationId)
      .subscribe((list: string[]) => this.sources = list);
  }

  create(): void {
    // Navigate relative to the parent route
    this.router.navigate(['sources', 'create'], { relativeTo: this.route.parent });
  }

  edit(name: string): void {
    this.router.navigate(['sources', encodeURIComponent(name), 'edit'], { relativeTo: this.route.parent });
  }

  delete(name: string): void {
    if (!confirm('Delete this source?')) { return; }
    this.svc.delete(this.simulationId, name)
      .subscribe(() => this.load());
  }
}