export interface QuoteCollectionInterface {
  customer_id?: string;
  currency: string;
  pdf: string;
  no_quote: number;
  bill?: string;
  notes?: string[];
  customer: {
    contact_name: string;
    contact_email?: string;
    contact_phone?: string;
    company: string;
    company_rfc?: string;
  };
  items: ItemInterface[];
  total: number;
  subtotal: number;
  tax: number;
  deleted?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface TaxInterface {
  name: string;
  amount: number;
}

export interface ItemInterface {
  name: string;
  description?: string;
  amount: number;
  quantity: number;
  tax: TaxInterface;
}
