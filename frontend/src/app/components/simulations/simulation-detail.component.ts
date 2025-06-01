import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { SimulationService } from '../../services/simulation.service';
import { SimulationRead } from '../../interfaces/simulation';
import { VolumeListComponent } from '../volumes/volume-list.component';
import { SourceListComponent } from '../sources/source-list.component';

@Component({
  selector: 'app-simulation-detail',
  standalone: true,
  imports: [CommonModule, VolumeListComponent, SourceListComponent],
  templateUrl: `simulation-detail.component.html`,
  styles: `
    .nav-tabs .nav-link {
      cursor: pointer;
    }
    .cursor-pointer {
      cursor: pointer;
    }

    .collapse-toggle-icon {
      transition: transform 0.2s ease;
    }

    .collapse:not(.show) + .collapse-toggle-icon {
      transform: rotate(-90deg);
    }
  `
})
export class SimulationDetailComponent implements OnInit {
  simulation: SimulationRead | null = null;
  private readonly simulationService = inject(SimulationService);

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      this.simulationService.readSimulation(id).subscribe(data => {
        this.simulation = data;
      });
    });
  }

  back(): void {
    this.router.navigate(['/simulations']);
  }

  get generalInfoItems() {
    if (!this.simulation) return [];
    const sim = this.simulation;
    return [
      { label: 'Number of Runs', value: sim.num_runs, icon: 'graph-up' },
      { label: 'Run Length', value: `${sim.run_len} second(s)`, icon: 'clock' },
      { label: 'Created', value: new Date(sim.created_at).toLocaleString(), icon: 'calendar' },
      { label: 'Output Directory', value: sim.output_dir, icon: 'folder' },
      { label: 'Archive File', value: sim.json_archive_filename, icon: 'file-earmark-zip' },
    ];
  }

  get actorConfigItems() {
    if (!this.simulation) return [];
    const actor = this.simulation.actor;
    return [
      { label: 'Attached To', value: actor.attached_to, icon: 'link' },
      { label: 'Spacing', value: `${actor.spacing[0]} mm x ${actor.spacing[1]} mm`, icon: 'arrows-expand' },
      { label: 'Size', value: `${actor.size[0]} px x ${actor.size[1]} px`, icon: 'bounding-box' },
      { label: 'Origin as Center?', value: actor.origin_as_image_center ? 'Yes' : 'No', icon: 'bullseye' },
    ];
  }
}
