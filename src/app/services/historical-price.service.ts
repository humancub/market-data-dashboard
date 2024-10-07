import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HistoricalPriceService {
  constructor(private http: HttpClient) {}

  getHistoricalData(
    instrumentId: string,
    startDate: string,
    endDate: string
  ): Observable<any> {
    const url = `https://platform.fintacharts.com/api/bars/v1/bars/date-range?instrumentId=${instrumentId}&startDate=${startDate}&endDate=${endDate}`;
    return this.http.get<any>(url);
  }
}
