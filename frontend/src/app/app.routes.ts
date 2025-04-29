import { Routes } from '@angular/router';
import { SimulationListComponent } from './components/simulations/simulation-list.component';
import { SimulationDetailComponent } from './components/simulations/simulation-detail.component';
import { SimulationCreateComponent } from './components/simulations/simulation-create.component';
import { HomeComponent } from './components/home/home.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'simulations', component: SimulationListComponent },
  { path: 'simulations/create', component: SimulationCreateComponent },
  { path: 'simulations/:id', component: SimulationDetailComponent },
];
