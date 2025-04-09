import { Injectable, inject, signal, resource } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageResponse, Simulation, SimulationCreate, SimulationUpdate } from '../models/simulation';

@Injectable({
  providedIn: 'root'
})
export class SimulationService {
  private readonly http = inject(HttpClient);
  private readonly url = 'http://127.0.0.1:8000/api/simulations';

  create(simulation: SimulationCreate) {
    return this.http.post<Simulation>(this.url, simulation);
  }  

  simulations() {
    return this.http.get<Simulation[]>(this.url);
  }
  
  simulation(id: number) {
    return this.http.get<Simulation>(`${this.url}/${id}`);
  }

  update(id: number, simulation: SimulationUpdate) {
    return this.http.put<Simulation>(`${this.url}/${id}`, simulation);
  }

  delete(id: number) {
    return this.http.delete<MessageResponse>(`${this.url}/${id}`);
  }

  view(id: number) {
    return this.http.get<MessageResponse>(`${this.url}/${id}/view`);
  }

  run(id: number) {
    return this.http.get<MessageResponse>(`${this.url}/${id}/run`);
  }
}
