import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import {
  SimulationCreate,
  SimulationRead,
  SimulationUpdate
} from '../interfaces/simulation';

import { MessageResponse } from '../interfaces/message';

@Injectable({
  providedIn: 'root',
})
export class SimulationService {
  private baseUrl = `${environment.apiBaseUrl}simulations`;

  constructor(private http: HttpClient) {}

  createSimulation(data: SimulationCreate): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseUrl}/`, data);
  }

  getSimulations(): Observable<SimulationRead[]> {
    return this.http.get<SimulationRead[]>(`${this.baseUrl}/`);
  }

  getSimulation(simulationId: number): Observable<SimulationRead> {
    return this.http.get<SimulationRead>(`${this.baseUrl}/${simulationId}`);
  }

  updateSimulation(
    simulationId: number,
    data: SimulationUpdate
  ): Observable<MessageResponse> {
    return this.http.put<MessageResponse>(`${this.baseUrl}/${simulationId}`, data);
  }

  deleteSimulation(simulationId: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.baseUrl}/${simulationId}`);
  }

  importSimulation(simulationId: number): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseUrl}/${simulationId}/import`, {});
  }

  exportSimulation(simulationId: number): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseUrl}/${simulationId}/export`, {});
  }

  viewSimulation(simulationId: number): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseUrl}/${simulationId}/view`, {});
  }

  runSimulation(simulationId: number): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseUrl}/${simulationId}/run`, {});
  }
}
