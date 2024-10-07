import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { WebSocketService } from '../../services/web-socket.service';
import { AuthService } from '../../services/auth.service';
import { ApiService, TokenStorageService } from '../../services';
import { SharedModule } from '../../shared';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-market-data',
  standalone: true,
  imports: [SharedModule, CommonModule],
  templateUrl: './market-data.component.html',
  styleUrls: ['./market-data.component.scss'],
})
export class MarketDataComponent implements OnInit, OnDestroy {
  private websocketSubscription!: Subscription;
  providers: any[] = [];
  exchanges: any[] = [];
  instruments: any[] = [];

  constructor(
    private webSocketService: WebSocketService,
    private authService: AuthService,
    private apiService: ApiService,
    private tokenStorage: TokenStorageService
  ) {}

  ngOnInit() {
    const username = 'r_test@fintatech.com';
    const password = 'kisfiz-vUnvy9-sopnyv';

    this.authService.getToken(username, password).subscribe({
      next: (response) => {
        const accessToken = response.access_token;
        this.webSocketService.connect(accessToken);
        const refreshToken = response.refresh_token;
        this.tokenStorage.saveTokens(accessToken, refreshToken);
        console.log('Access token:', accessToken);

        this.websocketSubscription = this.webSocketService
          .getRealTimeData()
          .subscribe((data) => {
            console.log('Real-time data:', data);
          });
        this.fetchProviders(accessToken);
        this.fetchExchanges(accessToken);
        this.fetchInstruments(accessToken);
      },
      error: (error) => {
        console.error('Error retrieving token:', error);
      },
    });
  }

  fetchProviders(token: string) {
    this.apiService.getInstrumentsProviders(token).subscribe({
      next: (response) => {
        this.providers = response.data;
        console.log('Providers:', this.providers);
      },
      error: (error) => {
        console.error('Error fetching providers:', error);
      },
    });
  }

  fetchExchanges(token: string) {
    this.apiService.getInstrumentsExchanges(token).subscribe({
      next: (response) => {
        this.exchanges = response;
        console.log('Exchanges', this.exchanges);
      },
      error: (error) => {
        console.error('Error fetching exchanges:', error);
      },
    });
  }

  fetchInstruments(token: string) {
    this.apiService.getInstruments(token).subscribe({
      next: (response) => {
        this.instruments = response;
        console.log('Instruments', this.instruments);
      },
      error: (error) => {
        console.error('Error fetching instruments:', error);
      },
    });
  }

  ngOnDestroy() {
    if (this.websocketSubscription) {
      this.websocketSubscription.unsubscribe();
    }
    this.webSocketService.disconnect();
  }
}
