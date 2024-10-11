import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TokenStorageService } from '.';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private tokenUrl = `${environment.fintachartsRestApiUrl}/identity/realms/fintatech/protocol/openid-connect/token`;
  private accessTokenSubject: BehaviorSubject<string | null> =
    new BehaviorSubject<string | null>(null);
  public accessToken$ = this.accessTokenSubject.asObservable();

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) {}

  getToken(username: string, password: string): Observable<any> {
    const body = new HttpParams()
      .set('grant_type', 'password')
      .set('client_id', 'app-cli')
      .set('username', username)
      .set('password', password);

    return this.http.post(this.tokenUrl, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  }

  refreshToken(): Observable<any> {
    const refreshToken = this.tokenStorage.getRefreshToken();
    const body = new HttpParams()
      .set('grant_type', 'refresh_token')
      .set('client_id', 'app-cli')
      .set('refresh_token', refreshToken || '');

    return this.http.post(this.tokenUrl, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  }
}
