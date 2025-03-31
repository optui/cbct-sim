import { provideRouter, Routes } from '@angular/router';
import { SimulationDetailComponent } from './components/simulation-detail/simulation-detail.component';

export const routes: Routes = [
  {
    path: 'simulations/:id',
    component: SimulationDetailComponent,  // Standalone detail component
  },
  {
    path: '',
    redirectTo: 'simulations/1',
    pathMatch: 'full'
  }
];

export const appRouterProviders = [
  provideRouter(routes),
];
