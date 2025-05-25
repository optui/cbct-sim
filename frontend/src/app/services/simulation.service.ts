import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import {
  SimulationCreate,
  SimulationRead,
  SimulationUpdate,
  ReconstructionParams    // ← import the new interface
} from '../interfaces/simulation';

import { MessageResponse } from '../interfaces/message';

@Injectable({
  providedIn: 'root',
})
export class SimulationService {
  private baseUrl = `${environment.apiBaseUrl}simulations/`;

  constructor(private http: HttpClient) { }

  createSimulation(
    sim: SimulationCreate
  ): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(this.baseUrl, sim);
  }

  readSimulations(): Observable<SimulationRead[]> {
    return this.http.get<SimulationRead[]>(this.baseUrl);
  }

  readSimulation(id: number): Observable<SimulationRead> {
    return this.http.get<SimulationRead>(`${this.baseUrl}${id}`);
  }

  updateSimulation(
    id: number,
    sim: SimulationUpdate
  ): Observable<MessageResponse> {
    return this.http.put<MessageResponse>(
      `${this.baseUrl}${id}`,
      sim
    );
  }

  deleteSimulation(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(
      `${this.baseUrl}${id}`
    );
  }

  importSimulation(id: number): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(
      `${this.baseUrl}${id}/import`,
      {}
    );
  }

  exportSimulation(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}${id}/export`, {
      responseType: 'blob',
    });
  }

  viewSimulation(id: number): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(
      `${this.baseUrl}${id}/view`,
      {}
    );
  }

  runSimulation(id: number): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(
      `${this.baseUrl}${id}/run`,
      {}
    );
  }

  reconstructSimulation(
    id: number,
    params: ReconstructionParams
  ): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(
      `${this.baseUrl}${id}/reconstruct`,
      params
    );
  }
}
