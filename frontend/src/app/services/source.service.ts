// src/app/services/source.service.ts

import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  GenericSourceCreate,
  GenericSourceRead,
  GenericSourceUpdate
} from '../interfaces/source';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SourceService {
  private readonly http = inject(HttpClient);

  // Strip any trailing slash from apiBaseUrl, then append '/simulations'
  private readonly base =
    environment.apiBaseUrl.replace(/\/+$/, '') + '/simulations';

  /**
   * GET /api/simulations/:simId/sources
   */
  list(simId: number): Observable<string[]> {
    return this.http.get<string[]>(
      `${this.base}/${simId}/sources`
    );
  }

  /**
   * GET /api/simulations/:simId/sources/:name
   */
  get(simId: number, name: string): Observable<GenericSourceRead> {
    return this.http.get<GenericSourceRead>(
      `${this.base}/${simId}/sources/${name}`
    );
  }

  /**
   * POST /api/simulations/:simId/sources
   */
  create(
    simId: number,
    source: GenericSourceCreate
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.base}/${simId}/sources`,
      source
    );
  }

  /**
   * PUT /api/simulations/:simId/sources/:name
   */
  update(
    simId: number,
    name: string,
    source: GenericSourceUpdate
  ): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      `${this.base}/${simId}/sources/${name}`,
      source
    );
  }

  /**
   * DELETE /api/simulations/:simId/sources/:name
   */
  delete(simId: number, name: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.base}/${simId}/sources/${name}`
    );
  }
}
