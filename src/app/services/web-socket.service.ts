import { Injectable } from '@angular/core';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket$!: WebSocketSubject<any>;

  connect(token: string): void {
    const wsUrl = `${environment.fintachartsWebSocketUrl}${token}`;
    this.socket$ = webSocket(wsUrl);

    this.socket$.subscribe({
      next: (msg) =>
        console.log('WebSocket connected and received message:', msg),
      error: (err) => console.error('WebSocket error:', err),
      complete: () => console.warn('WebSocket connection closed'),
    });
  }

  getRealTimeData(): Observable<any> {
    return this.socket$.asObservable();
  }

  sendSubscriptionMessage(subscriptionMessage: any): void {
    this.socket$.next(subscriptionMessage);
  }

  disconnect(): void {
    if (this.socket$) {
      this.socket$.complete();
    }
  }
}
