import { Routes } from '@angular/router';

// Import all components
import { SimulationListComponent } from './components/simulations/simulation-list.component';
import { SimulationCreateComponent } from './components/simulations/simulation-create.component';
import { SimulationDetailComponent } from './components/simulations/simulation-detail.component';
import { SimulationEditComponent } from './components/simulations/simulation-edit.component';

import { VolumeListComponent } from './components/volumes/volume-list.component';
import { VolumeCreateComponent } from './components/volumes/volume-create.component';
import { VolumeDetailComponent } from './components/volumes/volume-detail.component';
import { VolumeEditComponent } from './components/volumes/volume-edit.component';

import { SourceListComponent } from './components/sources/source-list.component';
import { SourceCreateComponent } from './components/sources/source-create.component';
import { SourceDetailComponent } from './components/sources/source-detail.component';
import { SourceEditComponent } from './components/sources/source-edit.component';

import { ActorListComponent } from './components/actors/actor-list.component';
import { ActorCreateComponent } from './components/actors/actor-create.component';
import { ActorDetailComponent } from './components/actors/actor-detail.component';
import { ActorEditComponent } from './components/actors/actor-edit.component';

export const routes: Routes = [
  { path: '', redirectTo: 'simulations', pathMatch: 'full' },

  // Simulation routes
  { path: 'simulations', component: SimulationListComponent },
  { path: 'simulations/create', component: SimulationCreateComponent },
  { path: 'simulations/:id', component: SimulationDetailComponent },
  { path: 'simulations/:id/edit', component: SimulationEditComponent },

  // Volume routes
  { path: 'simulations/:simId/volumes', component: VolumeListComponent },
  { path: 'simulations/:simId/volumes/create', component: VolumeCreateComponent },
  { path: 'simulations/:simId/volumes/:name', component: VolumeDetailComponent },
  { path: 'simulations/:simId/volumes/:name/edit', component: VolumeEditComponent },

  // Source routes
  { path: 'simulations/:simId/sources', component: SourceListComponent },
  { path: 'simulations/:simId/sources/create', component: SourceCreateComponent },
  { path: 'simulations/:simId/sources/:name', component: SourceDetailComponent },
  { path: 'simulations/:simId/sources/:name/edit', component: SourceEditComponent },

  // Actor routes
  { path: 'simulations/:simId/actors', component: ActorListComponent },
  { path: 'simulations/:simId/actors/create', component: ActorCreateComponent },
  { path: 'simulations/:simId/actors/:name', component: ActorDetailComponent },
  { path: 'simulations/:simId/actors/:name/edit', component: ActorEditComponent },

  { path: '**', redirectTo: 'simulations' }
];