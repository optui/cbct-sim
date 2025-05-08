import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  SimulationRead,
  SimulationCreate,
  SimulationUpdate,
  MessageResponse,
} from '../interfaces/simulation';

@Injectable({
  providedIn: 'root'
})
export class SimulationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl + 'simulations/';

  list(): Observable<SimulationRead[]> {
    return this.http.get<SimulationRead[]>(this.baseUrl);
  }

  get(id: number): Observable<SimulationRead> {
    return this.http.get<SimulationRead>(`${this.baseUrl}${id}`);
  }

  create(payload: SimulationCreate): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(this.baseUrl, payload);
  }

  update(id: number, payload: SimulationUpdate): Observable<MessageResponse> {
    return this.http.put<MessageResponse>(`${this.baseUrl}${id}`, payload);
  }

  delete(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.baseUrl}${id}`);
  }

  importSimulation(id: number): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseUrl}${id}/import`, {});
  }

  exportSimulation(id: number): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseUrl}${id}/export`, {});
  }

  viewSimulation(id: number): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseUrl}${id}/view`, {});
  }

  runSimulation(id: number): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseUrl}${id}/run`, {});
  }
}