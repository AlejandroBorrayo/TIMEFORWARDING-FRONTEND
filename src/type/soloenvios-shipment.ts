// Producto dentro de un paquete
export interface ProductRequest {
    name: string;
    description_en: string;
    quantity: number;
    price: number;
    sku: string;
    product_type_name: string;
    country_code: string;
  }
  
  // Paquete dentro del envío
  export interface PackageRequest {
    package_number: string;
    package_protected: boolean;
    declared_value: number;
    consignment_note: string;
    package_type: string;
  }
  
  // Dirección (remitente o destinatario)
  export interface AddressRequest {
    street1: string;
    name: string;
    company: string;
    phone: string;
    email: string;
    reference: string;
  }
  
  // Envío principal
  export interface ShipmentSoloenviosRequest {
    shipment:{
      rate_id: string;
      printing_format: string;
      address_from: AddressRequest;
      address_to: AddressRequest;
      packages: PackageRequest[];
    },

  }








  // ---------- Address ----------
export interface AddressAttributes {
  id: string;
  area_level1: string;
  area_level2: string;
  name: string;
  postal_code: string;
  country_code: string;
  address_type: "from" | "to";
  street1: string;
  company: string;
  phone: string;
  email: string;
  reference: string;
  area_level3: string;
  apartment_number: string | null;
}

export interface AddressResponse {
  id: string;
  type: "address";
  attributes: AddressAttributes;
  relationships: {
    shipment: {
      data: {
        id: string;
        type: "shipment";
      };
    };
  };
}

// ---------- Package ----------
export interface PackageAttributes {
  id: string;
  label_url: string;
  package_type: string;
  weight: string;
  length: string;
  width: string;
  height: string;
  consignment_note: string;
  tracking_status: string | null;
  created_at: string;
  updated_at: string;
  tracking_url_provider: string | null;
  tracking_number: string | null;
}

export interface PackageResponse {
  id: string;
  type: string;
  attributes: PackageAttributes;
  relationships: {
    shipment: {
      data: {
        id: string;
        type: string;
      };
    };
  };
}

// ---------- Shipment ----------
export interface ShipmentAttributes {
  id: string;
  carrier_name: string;
  workflow_status: string;
  payment_status: string;
  total: string;
  carrier_id: string;
  source: string;
  service_id: string;
  created_at: string;
  updated_at: string;
  original_shipment_id: string | null;
  master_tracking_number: string | null;
}

export interface Shipment {
  id: string;
  type: string;
  attributes: ShipmentAttributes;
  relationships: {
    packages: {
      data: { id: string; type: string}[];
    };
    address_from: {
      data: { id: string; type: string };
    };
    address_to: {
      data: { id: string; type: string };
    };
  };
}

// ---------- Root Response ----------
export interface ShipmentResponse {
  data: Shipment;
  included: (PackageResponse | AddressResponse)[];
}
