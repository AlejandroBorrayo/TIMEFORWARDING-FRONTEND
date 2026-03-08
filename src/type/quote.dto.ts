export interface Tax {
  name: string;
  amount: number;
}

export interface Item {
  name: string;
  currency: string;
  description?: string;
  amount: number;
  usd_amount: number;
  quantity: number;
  tax: Tax;
  supplier_id: string;
}

export interface QuoteDto {
  seller_userid: string;
  customer_id: string;
  contact_id: string;
  currency:string;
  period_end_date:Date;
  folio: string;
  service_cost: string;
  items: Item[];
  notes?: string[];
}