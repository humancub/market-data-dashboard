import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  constructor(private socket: Socket) {}

  connect(token: string): void {
    this.socket.ioSocket.io.opts.query = { token: token };
    this.socket.connect();
  }

  getRealTimeData(): Observable<any> {
    return this.socket.fromEvent('data');
  }

  disconnect(): void {
    this.socket.disconnect();
  }
}
