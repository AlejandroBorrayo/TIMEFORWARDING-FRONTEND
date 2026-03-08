interface Address {
  country_code: string;
  postal_code: string;
  area_level1: string;
  area_level2: string;
  area_level3: string;
}

export interface Parcel {
  length: number;
  width: number;
  height: number;
  weight: number;
}

export interface QuotationSoloenviosRequest {
  quotation: {
    address_from: Address;
    address_to: Address;
    parcels: Parcel[];
    requested_carriers: string[];
    colonies_to?: string[];
    colonies_from?: string[];
  };
}

// Interfaz para mensajes de error de las tarifas
export interface ErrorMessage {
  module: string;
  error_type: string;
  error_message: string;
}

// Interfaz para cada rate/cotización de envío
export interface RateSoloenvios {
  success: boolean;
  id: string;
  rate_type: string | null;
  provider_name: string;
  provider_display_name: string;
  provider_service_name: string;
  provider_service_code: string;
  status: string;
  currency_code: string | null;
  cost: number | null;
  amount: number | null;
  total: number | null;
  days: number | null;
  insurable: boolean | null;
  has_own_agreement: boolean;
  pickup: boolean | null;
  own_agreement_amount: number | null;
  extra_fees: number | null;
  zone: string | null;
  country_code: string | null;
  plan_type: string | null;
  packaging_type: string;
  error_messages: ErrorMessage[] | null;
  weight: number;
}

// Interfaz para el scope de la cotización
export interface QuotationScope {
  found_carriers: string[];
  carriers_scoped_to: string;
  not_found_carriers: string[];
}

// Interfaz para los paquetes
export interface Package {
  package_number: number;
  weight: string;
  length: string;
  width: string;
  height: string;
}

// Interfaz principal de la cotización
export interface Quotation {
  id: string;
  quotation_scope: QuotationScope;
  is_completed: boolean;
  rates: RateSoloenvios[];
  packages: Package[];
}


export interface RateSimple {
  id: string;
  courier: string;
  logo: string;
  type: string;
  cost: number;
  time: string;
  pickup?: boolean | null;
  source: 'soloenvios' | 'skydropx';
}