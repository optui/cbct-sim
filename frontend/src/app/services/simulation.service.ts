import { Injectable } from '@angular/core';
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
  private base = environment.apiBaseUrl + 'simulations/';

  constructor(private http: HttpClient) {}

  list(): Observable<SimulationRead[]> {
    return this.http.get<SimulationRead[]>(this.base);
  }

  get(id: number): Observable<SimulationRead> {
    return this.http.get<SimulationRead>(`${this.base}${id}`);
  }

  create(payload: SimulationCreate): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(this.base, payload);
  }

  update(id: number, payload: SimulationUpdate): Observable<MessageResponse> {
    return this.http.put<MessageResponse>(`${this.base}${id}`, payload);
  }

  delete(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.base}${id}`);
  }
}
