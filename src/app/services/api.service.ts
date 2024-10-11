import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = '/api';

  constructor(private http: HttpClient) {}

  getInstrumentsProviders(token: string): Observable<any> {
    const url = `${this.baseUrl}/api/instruments/v1/providers`;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.get(url, { headers });
  }

  getInstrumentsExchanges(token: string): Observable<any> {
    const url = `${this.baseUrl}/api/instruments/v1/exchanges`;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.get(url, { headers });
  }

  getInstruments(token: string, provider: string): Observable<any> {
    const url = `${this.baseUrl}/api/instruments/v1/instruments?provider=${provider}`;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.get(url, { headers });
  }
}
