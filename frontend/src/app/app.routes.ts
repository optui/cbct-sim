import { Routes } from '@angular/router';
import { ReadUpdateComponent } from './components/simulations/read-update/read-update.component';
import { CreateComponent } from './components/simulations/create/create.component';

export const routes: Routes = [
    { path: '', redirectTo:'', pathMatch: 'full' },
    { path: 'read/:id', component: ReadUpdateComponent },
    { path: 'create', component: CreateComponent }
];
