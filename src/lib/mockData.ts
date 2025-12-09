
export interface StockRow {
  id: string;
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  sector: string;
  industry?: string;
  pe: number;
  high52w?: number;
  low52w?: number;
  parentId?: string;
  isChild?: boolean;
  isDetailRow?: boolean;
  founded?: number;
  employees?: number;
  headquarters?: string;
  ceo?: string;
  website?: string;
}

// Constants
export const TICKERS = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'META', 'NVDA', 'TSLA', 'JPM', 'V', 'JNJ', 
                 'WMT', 'PG', 'DIS', 'NFLX', 'PYPL', 'ADBE', 'CRM', 'INTC', 'AMD', 'ORCL',
                 'IBM', 'CSCO', 'UBER', 'LYFT', 'SQ', 'SHOP', 'ZOOM', 'SNAP', 'TWTR', 'PINS'];

export const NAMES = ['Apple Inc.', 'Alphabet Inc.', 'Microsoft Corp.', 'Amazon.com Inc.', 'Meta Platforms', 
               'NVIDIA Corp.', 'Tesla Inc.', 'JPMorgan Chase', 'Visa Inc.', 'Johnson & Johnson',
               'Walmart Inc.', 'Procter & Gamble', 'Walt Disney', 'Netflix Inc.', 'PayPal Holdings',
               'Adobe Inc.', 'Salesforce Inc.', 'Intel Corp.', 'AMD Inc.', 'Oracle Corp.',
               'IBM Corp.', 'Cisco Systems', 'Uber Technologies', 'Lyft Inc.', 'Block Inc.',
               'Shopify Inc.', 'Zoom Video', 'Snap Inc.', 'Twitter Inc.', 'Pinterest Inc.'];

export const SECTORS = ['Technology', 'Healthcare', 'Financial', 'Consumer', 'Industrial', 'Energy'];
export const INDUSTRIES = ['Software', 'Hardware', 'Internet', 'Banking', 'Retail', 'Automotive'];
export const HEADQUARTERS = ['Cupertino, CA', 'Mountain View, CA', 'Redmond, WA', 'Seattle, WA', 'Menlo Park, CA',
                      'Santa Clara, CA', 'Austin, TX', 'New York, NY', 'San Francisco, CA', 'New Brunswick, NJ'];
export const CEOS = ['Tim Cook', 'Sundar Pichai', 'Satya Nadella', 'Andy Jassy', 'Mark Zuckerberg',
              'Jensen Huang', 'Elon Musk', 'Jamie Dimon', 'Ryan McInerney', 'Joaquin Duato'];

export const generateStockData = (count: number): StockRow[] => {
  const result: StockRow[] = new Array(count);
  const tickerLen = TICKERS.length;
  const nameLen = NAMES.length;
  const sectorLen = SECTORS.length;
  const industryLen = INDUSTRIES.length;
  const hqLen = HEADQUARTERS.length;
  const ceoLen = CEOS.length;
  
  for (let i = 0; i < count; i++) {
    const basePrice = Math.random() * 500 + 50;
    const change = (Math.random() - 0.5) * 20;
    
    result[i] = {
      id: `stock-${i + 1}`,
      ticker: i < tickerLen ? TICKERS[i] : `STK${i}`,
      name: i < nameLen ? NAMES[i] : `Company ${i + 1}`,
      price: Math.round(basePrice * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round((change / basePrice) * 10000) / 100,
      volume: Math.floor(Math.random() * 50000000) + 1000000,
      marketCap: Math.floor(Math.random() * 2000) + 10,
      sector: SECTORS[i % sectorLen],
      industry: INDUSTRIES[i % industryLen],
      pe: Math.round((Math.random() * 50 + 5) * 100) / 100,
      high52w: Math.round((basePrice * 1.3) * 100) / 100,
      low52w: Math.round((basePrice * 0.7) * 100) / 100,
      founded: 1970 + Math.floor(Math.random() * 50),
      employees: Math.floor(Math.random() * 200000) + 1000,
      headquarters: HEADQUARTERS[i % hqLen],
      ceo: i < ceoLen ? CEOS[i] : `CEO ${i + 1}`,
      website: `https://${(i < tickerLen ? TICKERS[i] : `company${i}`).toLowerCase()}.com`,
    };
  }
  return result;
};
