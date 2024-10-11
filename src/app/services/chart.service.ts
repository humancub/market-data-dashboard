import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChartData } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class ChartService {
  private baseUrl = '/api';

  constructor(private http: HttpClient) {}

  getTimeBackChart(
    token: string,
    instrumentId: string,
    provider: string,
    interval: string,
    periodicity: string,
    timeBack: number
  ): Observable<ChartData[]> {
    const url = `${this.baseUrl}/data-consolidators/bars/v1/bars/time-back?instrumentId=${instrumentId}&provider=${provider}&interval=${interval}&periodicity=${periodicity}&timeBack=${timeBack}`;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.get<ChartData[]>(url, { headers });
  }

  getDateRangeChart(
    token: string,
    instrumentId: string,
    provider: string,
    interval: string,
    periodicity: string,
    startDate: string
  ): Observable<any> {
    const url = `${this.baseUrl}/api/bars/v1/bars/date-range?instrumentId=${instrumentId}&provider=${provider}&interval=${interval}&periodicity=${periodicity}&startDate=${startDate}`;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
    return this.http.get(url, { headers });
  }

  getCountBackChart(
    token: string,
    instrumentId: string,
    provider: string,
    interval: string,
    periodicity: string,
    barsCount: string
  ) {
    const url = `${this.baseUrl}/api/bars/v1/bars/count-back?instrumentId=${instrumentId}&provider=${provider}&interval=${interval}&periodicity=${periodicity}&barsCount=${barsCount}`;

    const headers = new HttpHeaders({
      Authorization: `Bearer${token}`,
      'Content-Type': 'application/json',
    });
    return this.http.get(url, { headers });
  }
}
