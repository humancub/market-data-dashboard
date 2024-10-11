import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService, TokenStorageService } from '../../services';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> =
    new BehaviorSubject<string | null>(null);

  constructor(
    private authService: AuthService,
    private tokenStorage: TokenStorageService
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let authReq = req;
    const accessToken = this.tokenStorage.getAccessToken();
    if (accessToken) {
      authReq = this.addTokenHeader(req, accessToken);
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !this.isRefreshing) {
          return this.handle401Error(authReq, next);
        }
        return throwError(() => error);
      })
    );
  }

  private addTokenHeader(request: HttpRequest<any>, token: string) {
    return request.clone({
      headers: request.headers.set('Authorization', `Bearer ${token}`),
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    this.isRefreshing = true;
    this.refreshTokenSubject.next(null);

    return this.authService.refreshToken().pipe(
      switchMap((tokenResponse: any) => {
        this.isRefreshing = false;
        const newAccessToken = tokenResponse.access_token;
        this.tokenStorage.saveTokens(
          newAccessToken,
          tokenResponse.refresh_token
        );
        this.refreshTokenSubject.next(newAccessToken);
        return next.handle(this.addTokenHeader(request, newAccessToken));
      }),
      catchError((error) => {
        this.isRefreshing = false;
        this.tokenStorage.clearTokens();
        return throwError(() => error);
      })
    );
  }
}
