import { Component, OnInit, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SourceService } from '../../services/source.service';

@Component({
  selector: 'app-source-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: `source-list.component.html`
})
export class SourceListComponent implements OnInit {
  @Input() simulationId!: number;
  sources: string[] = [];

  private readonly sourceService = inject(SourceService);

  ngOnInit(): void {
    this.sourceService.getSources(this.simulationId).subscribe({
      next: (data) => (this.sources = data),
      error: (err) => {
        console.error('Failed to load sources:', err);
        this.sources = [];
      }
    });
  }

  deleteSource(name: string): void {
    if (!confirm(`Delete source "${name}"?`)) return;

    this.sourceService.deleteSource(this.simulationId, name).subscribe({
      next: () => {
        this.sources = this.sources.filter((s) => s !== name);
      },
      error: (err) => {
        alert(`Failed to delete source: ${err.message || err}`);
      }
    });
  }
}
