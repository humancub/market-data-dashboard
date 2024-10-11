export interface InstrumentResponse {
  paging: Paging;
  data: Instrument[];
}

export interface Paging {
  page: number;
  pages: number;
  items: number;
}

export interface Instrument {
  id: string;
  symbol: string;
  kind: string;
  exchange: string;
  description: string;
  tickSize: number;
  currency: string;
  mappings: Mappings;
  profile: Profile;
}

export interface Mappings {
  [provider: string]: MappingDetail;
}

export interface MappingDetail {
  symbol: string;
  exchange: string;
  defaultOrderSize: number;
}

export interface Profile {
  name: string;
  location: string;
  gics: Gics;
}

export interface Gics {
  sectorId: number;
  industryGroupId: number;
  industryId: number;
  subIndustryId: number;
}
