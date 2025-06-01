import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { SourceService } from '../../services/source.service';
import { SourceRead } from '../../interfaces/source';

@Component({
  selector: 'app-source-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: `source-detail.component.html`
})
export class SourceDetailComponent implements OnInit {
  source: SourceRead | null = null;
  simulationId!: number;
  sourceName!: string;

  private readonly sourceService = inject(SourceService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.simulationId = Number(this.route.snapshot.paramMap.get('simId'));
    this.sourceName = this.route.snapshot.paramMap.get('name')!;

    this.sourceService.getSource(this.simulationId, this.sourceName).subscribe(data => {
      this.source = data;
    });
  }

  back(): void {
    this.router.navigate(['/simulations', this.simulationId]);
  }
}
