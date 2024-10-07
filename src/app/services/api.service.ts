import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = environment.fintachartsRestApiUrl;

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

  getInstruments(token: string): Observable<any> {
    const url = `${this.baseUrl}/api/instruments/v1/instruments?provider=simulation`;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'applicationjson',
    });

    return this.http.get(url, { headers });
  }
}
