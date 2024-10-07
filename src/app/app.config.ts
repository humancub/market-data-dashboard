import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';

import { routes } from './app.routes';
import { HTTP_INTERCEPTORS, provideHttpClient } from '@angular/common/http';
import { AuthInterceptor } from './shared';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

const socketConfig: SocketIoConfig = { url: 'wss://platform.fintacharts.com/api/streaming/ws/v1/realtime?token=', options: {} }; 


export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), 
    provideHttpClient(),
    importProvidersFrom(SocketIoModule.forRoot(socketConfig)),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }, provideAnimationsAsync()
  ]
};
