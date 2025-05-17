import { Routes } from '@angular/router';

// Import all components
import { SimulationListComponent } from './components/simulations/simulation-list.component'
import { SimulationDetailComponent } from './components/simulations/simulation-detail.component';
import { SimulationFormComponent } from './components/simulations/simulation-form.component';
import { VolumeListComponent } from './components/volumes/volume-list.component';
import { VolumeDetailComponent } from './components/volumes/volume-detail.component';
import { VolumeFormComponent } from './components/volumes/volume-form.component';
import { SourceListComponent } from './components/sources/source-list.component';
import { SourceFormComponent } from './components/sources/source-form.component';
import { SourceDetailComponent } from './components/sources/source-detail.component';

// routes.ts
export const routes: Routes = [
  { path: '', redirectTo: 'simulations', pathMatch: 'full' },

  { path: 'simulations', component: SimulationListComponent },
  { path: 'simulations/new', component: SimulationFormComponent },
  { path: 'simulations/:id', component: SimulationDetailComponent },
  { path: 'simulations/:id/edit', component: SimulationFormComponent },

  { path: 'simulations/:simId/volumes', component: VolumeListComponent },
  { path: 'simulations/:simId/volumes/new', component: VolumeFormComponent },
  { path: 'simulations/:simId/volumes/:name', component: VolumeDetailComponent },
  { path: 'simulations/:simId/volumes/:name/edit', component: VolumeFormComponent },

  { path: 'simulations/:simId/sources', component: SourceListComponent },
  { path: 'simulations/:simId/sources/new', component: SourceFormComponent },
  { path: 'simulations/:simId/sources/:name', component: SourceDetailComponent },
  { path: 'simulations/:simId/sources/:name/edit', component: SourceFormComponent },

  { path: '**', redirectTo: '' }
];