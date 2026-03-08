export interface SupplierHistoryItem {
    folio: string;
    service_cost_id: string;
    no_service_cost: string;
    item: ItemDetail;
    supplier: Supplier;
  }
  
  export interface ItemDetail {
    _id:string
    name: string;
    currency: string;
    description: string;
    total:number;
    amount: number;
    usd_amount: number;
    quantity: number;
    tax: Tax;
    supplier: Supplier;
  }
  
  export interface Tax {
    _id: string;
    name: string;
    amount: number;
  }
  
  export interface Supplier {
    _id: string;
    name: string;
    history: SupplierHistory[];
  }
  
  export interface SupplierHistory {
    _id:string
    payment: number;
    status: string;
    currency:string;
    created_at?: Date;
    updated_at?: Date;
  }


  