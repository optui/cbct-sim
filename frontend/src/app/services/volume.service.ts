import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import {
  VolumeCreate,
  VolumeUpdate,
  VolumeRead
} from '../interfaces/volume';

import { MessageResponse } from '../interfaces/message';

@Injectable({
  providedIn: 'root',
})
export class VolumeService {
  private baseUrl = `${environment.apiBaseUrl}simulations`;

  constructor(private http: HttpClient) {}

  getVolumes(simulationId: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/${simulationId}/volumes`);
  }

  createVolume(
    simulationId: number,
    volume: VolumeCreate
  ): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseUrl}/${simulationId}/volumes`, volume);
  }

  getVolume(simulationId: number, name: string): Observable<VolumeRead> {
    return this.http.get<VolumeRead>(`${this.baseUrl}/${simulationId}/volumes/${name}`);
  }

  updateVolume(
    simulationId: number,
    name: string,
    volume: VolumeUpdate
  ): Observable<MessageResponse> {
    return this.http.put<MessageResponse>(`${this.baseUrl}/${simulationId}/volumes/${name}`, volume);
  }

  deleteVolume(simulationId: number, name: string): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.baseUrl}/${simulationId}/volumes/${name}`);
  }
}
