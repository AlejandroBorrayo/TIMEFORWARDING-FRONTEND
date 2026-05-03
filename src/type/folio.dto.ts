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
}

export interface FolioDtoInterface {
  seller_userid: string;
  items: Item[];
  currency?: string;
  current_folio?: string;
}