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
  eur_amount?: number;
  quantity: number;
  tax: Tax;
  supplier_id: string;
  total_mxn?: number;
  total_usd?: number;
  total_eur?: number;
}

export interface QuoteDto {
  logo_url: string;
  company_name: string;
  seller_userid: string;
  customer_id: string;
  contact_id: string;
  currency: string;
  period_end_date: Date;
  folio: string;
  service_cost: string;
  items: Item[];
  notes?: string[];
  /** Subtotal del documento en la moneda resuelta (sin impuestos). */
  subtotal?: number;
  /** Total del documento en la moneda resuelta (con impuestos). */
  total?: number;
}