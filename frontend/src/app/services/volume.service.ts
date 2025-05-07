import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { VolumeCreate, VolumeRead, VolumeUpdate } from '../interfaces/volume';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { MessageResponse } from '../interfaces/simulation';

@Injectable({ providedIn: 'root' })
export class VolumeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl + 'simulations/';

  list(simulationId: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}${simulationId}/volumes`);
  }

  get(simulationId: number, name: string): Observable<VolumeRead> {
    return this.http.get<VolumeRead>(`${this.baseUrl}${simulationId}/volumes/${encodeURIComponent(name)}`);
  }

  create(simulationId: number, volume: VolumeCreate): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseUrl}${simulationId}/volumes`, volume);
  }

  update(simulationId: number, name: string, volume: VolumeUpdate): Observable<MessageResponse> {
    return this.http.put<MessageResponse>(`${this.baseUrl}${simulationId}/volumes/${encodeURIComponent(name)}`, volume);
  }

  delete(simulationId: number, name: string): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.baseUrl}${simulationId}/volumes/${encodeURIComponent(name)}`);
  }
}