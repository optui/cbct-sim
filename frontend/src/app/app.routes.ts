import { Routes } from '@angular/router';
import { ReadUpdateComponent } from './components/simulations/read-update/read-update.component';

export const routes: Routes = [
    { path: '', redirectTo:'', pathMatch: 'full' },
    { path: 'read/:id', component: ReadUpdateComponent }
];
