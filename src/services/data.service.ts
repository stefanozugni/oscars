// src/app/data.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Nomination } from '../models/nomination.model';

@Injectable({
    providedIn: 'root'
})
export class DataService {
    constructor(private http: HttpClient) { }

    getDataByYear(year: string | number): Observable<Nomination[]> {
      //url
      const url = `assets/json/${year}.json`;
      return this.http.get<Nomination[]>(url);
    }
}
