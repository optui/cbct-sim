import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ActorCreate, ActorRead, ActorUpdate } from '../interfaces/actor';
import { MessageResponse } from '../interfaces/simulation';

@Injectable({
  providedIn: 'root',
})
export class ActorService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}simulations/`;

  list(simulationId: number): Observable<string[]> {
    return this.http.get<string[]>(
      `${this.baseUrl}${simulationId}/actors`
    );
  }

  create(
    simulationId: number,
    actor: ActorCreate
  ): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(
      `${this.baseUrl}${simulationId}/actors`,
      actor
    );
  }

  get(
    simulationId: number,
    actorName: string
  ): Observable<ActorRead> {
    return this.http.get<ActorRead>(
      `${this.baseUrl}${simulationId}/actors/${encodeURIComponent(
        actorName
      )}`
    );
  }

  update(
    simulationId: number,
    actorName: string,
    actorUpdate: ActorUpdate
  ): Observable<MessageResponse> {
    return this.http.put<MessageResponse>(
      `${this.baseUrl}${simulationId}/actors/${encodeURIComponent(
        actorName
      )}`,
      actorUpdate
    );
  }

  delete(
    simulationId: number,
    actorName: string
  ): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(
      `${this.baseUrl}${simulationId}/actors/${encodeURIComponent(
        actorName
      )}`
    );
  }
}
