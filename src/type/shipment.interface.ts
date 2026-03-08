// ---------- Address ----------
export interface Address {
  id: string;
  area_level1: string;
  area_level2: string;
  area_level3?: string;
  name: string;
  postal_code: string;
  country_code: string;
  address_type: string;
  street1: string;
  company?: string;
  phone: string;
  email: string;
  reference?: string;
  apartment_number?: string | null;
}

// ---------- Address Wrapper ----------
export interface AddressWrapper {
  name: string;
  email: string;
  phone: string;
  company?: string;
  address: Address;
}

// ---------- History ----------

export interface HistoryData {
  _id?: string; // Natural de Mongo
  description?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

// ---------- Package ----------
export interface Package {
  id: string;
  label_url: string;
  package_type: string;
  weight: string;
  length: string;
  width: string;
  height: string;
  consignment_note: string;
  tracking_status: string | null;
  created_at?: Date;
  updated_at?: Date;
  tracking_url_provider: string | null;
  tracking_number: string | null;
}

// ---------- Shipment ----------
export interface ShipmentCollectionInterface {
  _id?: string; // Natural de Mongo
  api_used: string;
  userid: string;
  collection_id?: string;
  order: string;
  status: string;
  address_from: AddressWrapper;
  address_to: AddressWrapper;
  // Soloenvíos
  soloenvios_id?: string;
  skydropx_id?: string;
  rate_id?: string;
  api_tracking_number?: string;

  history: HistoryData[];

  // Carrier
  carrier_name: string;
  total: number;
  amount: number;
  commission: number;

  // Paquete
  packages: Package[];

  // Soft delete
  deleted?: boolean;

  // Timestamps
  created_at?: Date;
  updated_at?: Date;
}
