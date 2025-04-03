// simulation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Simulation, SimulationCreate, SimulationUpdate, MessageResponse } from '../models/simulation';

@Injectable({
  providedIn: 'root'
})
export class SimulationService {
  private apiUrl = 'http://127.0.0.1:8000/api/simulations';
  
  // Add a BehaviorSubject to track the simulations
  private simulationsSubject = new BehaviorSubject<Simulation[]>([]);
  public simulations$ = this.simulationsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getSimulations(): Observable<Simulation[]> {
    return this.http.get<Simulation[]>(`${this.apiUrl}/`).pipe(
      tap(simulations => this.simulationsSubject.next(simulations))
    );
  }

  getSimulation(simulationId: number): Observable<Simulation> {
    return this.http.get<Simulation>(`${this.apiUrl}/${simulationId}`);
  }

  createSimulation(simulation: SimulationCreate): Observable<Simulation> {
    return this.http.post<Simulation>(`${this.apiUrl}/`, simulation).pipe(
      tap(newSim => {
        const currentSims = this.simulationsSubject.value;
        this.simulationsSubject.next([...currentSims, newSim]);
      })
    );
  }

  updateSimulation(simulationId: number, simulation: SimulationUpdate): Observable<Simulation> {
    return this.http.put<Simulation>(`${this.apiUrl}/${simulationId}`, simulation).pipe(
      tap(updatedSim => {
        const currentSims = this.simulationsSubject.value;
        const updatedSims = currentSims.map(sim => 
          sim.id === simulationId ? updatedSim : sim
        );
        this.simulationsSubject.next(updatedSims);
      })
    );
  }

  deleteSimulation(simulationId: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.apiUrl}/${simulationId}`).pipe(
      tap(() => {
        const currentSims = this.simulationsSubject.value;
        const updatedSims = currentSims.filter(sim => sim.id !== simulationId);
        this.simulationsSubject.next(updatedSims);
      })
    );
  }

  // Other methods remain the same...
}