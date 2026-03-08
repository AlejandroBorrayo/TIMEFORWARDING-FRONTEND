
export interface FolioCollectionInterface {
  _id?: string;
  seller_userid: UserInterface;
  folio: string;
  service_cost: ServiceCostInterface[];
  deleted?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface UserInterface {
  _id: string;
  full_name: string;
  email?: string;
  phone?: string;
  role?: string;
  deleted?: boolean;
  commission?: number;
  type_commission?: "percentage" | "amount";
  created_at?: Date | string;
  updated_at?: Date | string;
  __v?: number;
}

export interface TaxInterface {
  name: string;
  amount: number;
}

export interface ItemInterface {
  name: string;
  description?: string;
  amount: number;
  usd_amount: number;
  currency: string;
  total:number;
  quantity: number;
  tax: TaxInterface;
  supplier: SupplierInterface;
}

export interface CustomerInterface {
  _id?:string
  contact_name: string;
  contact_email?: string;
  contact_phone?: string;
  company: string;
  company_rfc?: string;
}

export interface SupplierInterface {
  _id?: string;
  name: string;
  paid:number
  pending:number
  total:number
  history:SupplierHistoryInterface[]
}

export interface SupplierHistoryInterface {
  _id?: string;
  payment: number;
  pending: number;
  to_pay: number;
  total:number;
  created_at?:Date
}



export interface CustomerPaymentHistoryInterface {
  _id?: string;
  payment: number;
  status: string;
  currency: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface QuoteInterface {
  _id?: string;
  customer_id?: string;
  pdf_url: string;
  currency:string;
  no_quote: string;
  period_end_date: Date;
  bill?: string;
  active:boolean
  items: ItemInterface[];
  notes?: string[];
  customer: CustomerInterface;
  history?: CustomerPaymentHistoryInterface[];
  total: number;
  subtotal: number;
  tax: number;
  deleted?: boolean;
  created_at?: Date;
  updated_at?: Date;
}


export interface ServiceCostInterface {
  _id:string
  items: ItemInterface[];
  no_service_cost:string
  active:boolean;
  total: number;
  currency: string;
  quotes: QuoteInterface[];
  subtotal: number;
  tax: number;
  pdf_url: string;
  deleted?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface QuoteByCustomerItem {
  _id: string;
  folio: string;
  service_cost: {
    _id: string;
    no_service_cost: string;
    active: boolean;
  };
  created_at: string;
  seller: UserInterface;
  quote: QuoteInterface;
}
