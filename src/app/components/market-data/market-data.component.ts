import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { WebSocketService } from '../../services/web-socket.service';
import { AuthService } from '../../services/auth.service';
import { ApiService, TokenStorageService, ChartService } from '../../services';
import { MaterialModule } from '../../shared';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { CONFIG } from '../../app.config';
import { ChartData, Instrument, RealTimeData } from '../../interfaces';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-market-data',
  standalone: true,
  imports: [MaterialModule, CommonModule],
  templateUrl: './market-data.component.html',
  styleUrls: ['./market-data.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketDataComponent implements OnInit, OnDestroy {
  private websocketSubscription!: Subscription;
  providers: string[] = [];
  exchanges: string[] = [];
  instruments: Instrument[] = [];
  accessToken!: string;
  currentRealTimeData: RealTimeData = {
    ask: null,
    bid: null,
    last: null,
  };

  selectedInstrumentSymbol: string = '';
  chart: Chart | null = null;
  chartData: ChartData[] = [];
  interval: string = '60';
  periodicity: string = 'minute';
  selectedProvider: string = '';
  selectedInstrumentId!: string;
  isSubscribeDisabled: boolean = true;
  hasFetchedData: boolean = false;

  periods = [
    { value: '1', viewValue: '1 Day' },
    { value: '5', viewValue: '5 Days' },
    { value: '7', viewValue: '1 Week' },
  ];
  selectedPeriod: string = '1';

  constructor(
    private webSocketService: WebSocketService,
    private authService: AuthService,
    private apiService: ApiService,
    private tokenStorage: TokenStorageService,
    private chartService: ChartService,
    private snackBar: MatSnackBar,
    private cd: ChangeDetectorRef
  ) {
    Chart.register(...registerables);
  }

  ngOnInit() {
    this.initializeData();
  }

  private initializeData() {
    const { username, password } = CONFIG;

    this.authService.getToken(username, password).subscribe({
      next: (response) => {
        this.accessToken = response.access_token;
        this.tokenStorage.saveTokens(this.accessToken, response.refresh_token);
        this.webSocketService.connect(this.accessToken);
        this.subscribeToRealTimeData();
        this.fetchProviders(this.accessToken);
      },
      error: (error) => {
        this.showErrorSnackbar('Error retrieving token', error);
      },
    });
  }

  private subscribeToRealTimeData() {
    this.websocketSubscription = this.webSocketService
      .getRealTimeData()
      .subscribe((data) => {
        this.updateCurrentRealTimeData(data);
      });
  }

  private updateCurrentRealTimeData(data: RealTimeData) {
    this.currentRealTimeData.ask = data.ask ?? this.currentRealTimeData.ask;
    this.currentRealTimeData.bid = data.bid ?? this.currentRealTimeData.bid;
    this.currentRealTimeData.last = data.last ?? this.currentRealTimeData.last;

    this.cd.markForCheck(); 
  }

  private showNoDataSnackbar() {
    this.snackBar.open(
      'Sorry, no data available for this selection.',
      'Close',
      {
        duration: 3000,
      }
    );
  }

  private showErrorSnackbar(message: string, error: any) {
    this.snackBar.open(`${message}: ${error.message || error}`, 'Close', {
      duration: 5000,
    });
  }

  fetchDateRangeChartWithPeriod() {
    const startDate = this.calculateStartDate();
    this.fetchDateRangeChart(
      this.selectedInstrumentId,
      this.selectedProvider,
      startDate
    );
  }

  private calculateStartDate(): string {
    const daysAgo =
      this.selectedPeriod === '1' ? 1 : this.selectedPeriod === '5' ? 5 : 7;
    return this.formatDate(
      new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
    );
  }

  fetchDateRangeChart(
    selectedInstrumentId: string,
    provider: string,
    startDate: string
  ) {
    this.chartService
      .getDateRangeChart(
        this.accessToken,
        selectedInstrumentId,
        provider,
        this.interval,
        this.periodicity,
        startDate
      )
      .subscribe({
        next: (data: any) => {
          this.chartData = data.data;
          this.createChart();
        },
        error: (error) => {
          this.showErrorSnackbar('Error fetching date range chart', error);
        },
      });
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  createChart() {
    this.chart?.destroy();

    const labels = this.chartData.map((item) =>
      this.formatChartDate(new Date(item.t))
    );
    const prices = this.chartData.map((item) => item.c);

    this.chart = new Chart('myChart', {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Price',
            data: prices,
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: {
            title: { display: true, text: 'Time' },
          },
          y: {
            title: { display: true, text: 'Price' },
          },
        },
      },
    });

    this.cd.markForCheck(); 
  }

  formatChartDate(date: Date): string {
    return date.toLocaleString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  fetchProviders(token: string) {
    this.apiService.getInstrumentsProviders(token).subscribe({
      next: (response) => {
        this.providers = response.data;
      },
      error: (error) => {
        this.showErrorSnackbar('Error fetching providers', error);
      },
    });
  }

  fetchInstruments(provider: string) {
    this.selectedProvider = provider;
    this.apiService.getInstruments(this.accessToken, provider).subscribe({
      next: (response) => {
        this.instruments = response.data;
      },
      error: (error) => {
        this.showErrorSnackbar('Error fetching instruments', error);
      },
    });
  }

  onInstrumentSelect(instrument: Instrument) {
    this.selectedInstrumentSymbol = instrument.symbol;
    this.selectedInstrumentId = instrument.id;
    this.isSubscribeDisabled = false;
  }

  subscribe() {
    const subscriptionMessage = {
      type: 'l1-subscription',
      id: '1',
      instrumentId: this.selectedInstrumentId,
      provider: this.selectedProvider,
      subscribe: true,
      kinds: ['ask', 'bid', 'last'],
    };
  
    this.webSocketService.sendSubscriptionMessage(subscriptionMessage);
    const startDate = this.formatDate(
      new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    );
    this.fetchDateRangeChart(
      this.selectedInstrumentId,
      this.selectedProvider,
      startDate
    );
    
    this.websocketSubscription = this.webSocketService
      .getRealTimeData()
      .subscribe({
        next: (data) => {
          this.updateCurrentRealTimeData(data); 
        },
        error: () => {
          this.showNoDataSnackbar();
        },
      });
  }
  

  ngOnDestroy() {
    this.websocketSubscription?.unsubscribe();
    this.webSocketService.disconnect();
  }
}
