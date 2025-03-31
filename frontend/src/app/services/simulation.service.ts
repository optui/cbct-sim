import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Simulation {
  id?: number;
  name: string;
  created_at?: string;
  output_dir?: string;
  json_archive_filename?: string;
}

@Injectable({ providedIn: 'root' })
export class SimulationService {
  private baseUrl = 'http://localhost:8000/api/simulations';

  constructor(private http: HttpClient) {}

  getSimulations(): Observable<Simulation[]> {
    return this.http.get<Simulation[]>(`${this.baseUrl}/`);
  }

  createSimulation(simulation: {name: string}): Observable<Simulation> {
    return this.http.post<Simulation>(`${this.baseUrl}/`, simulation);
  }

  getSimulation(id: number): Observable<Simulation> {
    return this.http.get<Simulation>(`${this.baseUrl}/${id}`);
  }

  updateSimulation(id: number, simulation: {name: string}): Observable<Simulation> {
    return this.http.put<Simulation>(`${this.baseUrl}/${id}`, simulation);
  }

  deleteSimulation(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }

  runSimulation(id: number): Observable<{ message: string }> {
    return this.http.get<{ message: string }>(`${this.baseUrl}/${id}/run`);
  }

  viewSimulation(id: number): Observable<{ message: string }> {
    return this.http.get<{ message: string }>(`${this.baseUrl}/${id}/view`);
  }
}
