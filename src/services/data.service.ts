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

  private jsonPath = 'assets/json';


  getDataByYear(year: number | string): Observable<Nomination[]> {
    const fileName = `${year}.json`;
    const url = `${this.jsonPath}/${fileName}`;
    return this.http.get<Nomination[]>(url);
  }
}
