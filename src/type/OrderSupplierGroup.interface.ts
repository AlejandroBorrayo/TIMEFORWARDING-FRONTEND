export interface SupplierPaymentHistory {
  _id: string;
  payment: number;
  status: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  _id: string;
  name: string;
  currency: string;
  description?: string;
  amount: number;
  quantity: number;
  total: number;
  supplier: {
    _id: string;
    name: string;
    history: SupplierPaymentHistory[];
  };
}

export interface OrderSupplierGroup {
  supplier_id: string;
  folio: string;
  total_amount: number;
  total_items: number;
  supplier: {
    _id: string;
    name: string;
    history: SupplierPaymentHistory[];
  };
  items: OrderItem[];
}
