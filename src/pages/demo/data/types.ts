
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
    carro?: {
        cor?: string;
    }
    pe: number;
    parentId?: string;
    isChild?: boolean;
    isDetailRow?: boolean;
    founded?: number;
    employees?: number;
    headquarters?: string;
    ceo?: string;
    website?: string;
}
