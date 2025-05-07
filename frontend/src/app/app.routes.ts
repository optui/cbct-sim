import { Routes } from '@angular/router';

import { SimulationListComponent }   from './components/simulations/simulation-list.component';
import { SimulationCreateComponent } from './components/simulations/simulation-create.component';
import { SimulationDetailComponent } from './components/simulations/simulation-detail.component';
import { SimulationEditComponent }   from './components/simulations/simulation-edit.component';

import { VolumeListComponent }       from './components/volumes/volume-list.component';
import { VolumeCreateComponent }     from './components/volumes/volume-create.component';
import { VolumeDetailComponent }     from './components/volumes/volume-detail.component';
import { VolumeEditComponent }       from './components/volumes/volume-edit.component';

import { SourceListComponent }       from './components/sources/source-list.component';
import { SourceCreateComponent }     from './components/sources/source-create.component';
import { SourceDetailComponent }     from './components/sources/source-detail.component';
import { SourceEditComponent }       from './components/sources/source-edit.component';

import { ActorListComponent }        from './components/actors/actor-list.component';
import { ActorCreateComponent }      from './components/actors/actor-create.component';
import { ActorDetailComponent }      from './components/actors/actor-detail.component';
import { ActorEditComponent }        from './components/actors/actor-edit.component';

export const routes: Routes = [
  { path: '', redirectTo: 'simulations', pathMatch: 'full' },

  // Simulation CRUD
  { path: 'simulations',           component: SimulationListComponent },
  { path: 'simulations/create',    component: SimulationCreateComponent },
  {
    path: 'simulations/:id',
    component: SimulationDetailComponent,
    children: [
      // default child: volumes
      { path: '', redirectTo: '', pathMatch: 'full' },

      // volumes
      { path: 'volumes',                    component: VolumeListComponent },
      { path: 'volumes/create',             component: VolumeCreateComponent },
      { path: 'volumes/:volumeName',        component: VolumeDetailComponent },
      { path: 'volumes/:volumeName/edit',   component: VolumeEditComponent },

      // sources
      { path: 'sources',                    component: SourceListComponent },
      { path: 'sources/create',             component: SourceCreateComponent },
      { path: 'sources/:name',              component: SourceDetailComponent },
      { path: 'sources/:name/edit',         component: SourceEditComponent },

      // actors
      { path: 'actors',                     component: ActorListComponent },
      { path: 'actors/create',              component: ActorCreateComponent },
      { path: 'actors/:name',               component: ActorDetailComponent },
      { path: 'actors/:name/edit',          component: ActorEditComponent },
    ]
  },
  { path: 'simulations/:id/edit', component: SimulationEditComponent },

  // fallback
  { path: '**', redirectTo: 'simulations' }
];
