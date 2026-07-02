// src/app/data.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, forkJoin, map, Observable, of, tap } from 'rxjs';
import { Nomination } from '../models/nomination.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private http: HttpClient) { }

  private jsonPath = 'assets/json';
  private allDataCache: Nomination[] | null = null;


  getDataByYear(year: number | string): Observable<Nomination[]> {
    const fileName = `${year}.json`;
    const url = `${this.jsonPath}/${fileName}`;
    return this.http.get<Nomination[]>(url).pipe(
      map(nominations =>
        nominations.map(nomination => ({
          ...nomination,
          Winner: nomination.Winner === true ? 'True' : String(nomination.Winner ?? '')
        }))
      )
    );
  }

  getAllDataByYears(years: (number | string)[]): Observable<Nomination[]> {
    if (this.allDataCache) {
      return of(this.allDataCache);
    }

    return forkJoin(
      years.map(year =>
        this.getDataByYear(year).pipe(
          catchError(() => of([] as Nomination[]))
        )
      )
    ).pipe(
      map(results => results.flat()),
      tap(nominations => {
        this.allDataCache = nominations;
      })
    );
  }
}
