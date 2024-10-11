export interface PriceVolumeData {
  timestamp: string;
  price: number;
  volume: number;
}

export interface RealTimeData {
  bid?: PriceVolumeData | null;
  ask?: PriceVolumeData | null;
  last?: PriceVolumeData | null;
}
