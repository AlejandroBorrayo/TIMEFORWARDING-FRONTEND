import axios from "axios";
import type { PageOptionsDto, PageMetaDto } from "@/type/general";
import type { FolioDtoInterface } from "@/type/folio.dto";
import type { FolioCollectionInterface } from "@/type/folio.interface";
import { SupplierHistoryItem } from "@/type/supplier-history";
import { OrderSupplierGroup } from "@/type/OrderSupplierGroup.interface";

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

type FolioFilters = {
  no_quote?: number;
  customer?: string;
  seller_filter_userid?: string;
  start_date?: string | Date;
  end_date?: string | Date;
  supplier?: string;
};

type ReportCsvResponse = {
  success: boolean;
  message: string;
};

export const FindAll = async (
  pagination: PageOptionsDto,
  seller_userid: string,
  seller_name?: string,
  folio?: string,
  filters?: FolioFilters
): Promise<PageMetaDto<FolioCollectionInterface>> => {
  const sellerUseridFilter = filters?.seller_filter_userid?.trim();
  const { data } = await axios.post(
    `${NEXT_PUBLIC_API_URL}/folio/all`,
    {
      pagination,
      seller_userid: sellerUseridFilter || seller_userid,
      seller_name,
      folio,
      no_quote: filters?.no_quote,
      customer: filters?.customer,
      start_date: filters?.start_date,
      end_date: filters?.end_date,
      supplier: filters?.supplier,
    },
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
      },
    }
  );

  return data;
};

export const ReportCsv = async (
  pagination: PageOptionsDto,
  seller_userid: string,
  email: string,
  seller_name?: string,
  folio?: string,
  filters?: FolioFilters
): Promise<ReportCsvResponse> => {
  const sellerUseridFilter = filters?.seller_filter_userid?.trim();
  const { data } = await axios.post(
    `${NEXT_PUBLIC_API_URL}/folio/report/csv`,
    {
      pagination,
      seller_userid: sellerUseridFilter || seller_userid,
      email,
      seller_name,
      folio,
      no_quote: filters?.no_quote,
      customer: filters?.customer,
      start_date: filters?.start_date,
      end_date: filters?.end_date,
      supplier: filters?.supplier,
    },
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
      },
    }
  );

  return data;
};

export const Find = async (_id: string): Promise<FolioCollectionInterface> => {
  const { data } = await axios.get(`${NEXT_PUBLIC_API_URL}/folio/${_id}`, {
    headers: {
      "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
    },
  });

  return data;
};

export const Create = async (
  body: FolioDtoInterface
): Promise<FolioCollectionInterface> => {
  const { data } = await axios.post(
    `${NEXT_PUBLIC_API_URL}/folio`,
    { ...body },
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
      },
    }
  );
  return data;
};

export const SetServiceCostActive = async (body: {
  folio: string;
  no_service_cost: string;
}): Promise<FolioCollectionInterface> => {
  const { data } = await axios.put(
    `${NEXT_PUBLIC_API_URL}/folio/service-cost-active`,
    { ...body },
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
      },
    }
  );
  return data;
};

export const SetQuoteActive = async (body: {
  folio: string;
  quote: string;
}): Promise<FolioCollectionInterface> => {
  const { data } = await axios.put(
    `${NEXT_PUBLIC_API_URL}/folio/quote-active`,
    { ...body },
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
      },
    }
  );
  return data;
};

export const SupplierHistory = async (
  supplierid: string
): Promise<SupplierHistoryItem[]> => {
  const { data } = await axios.get(
    `${NEXT_PUBLIC_API_URL}/supplier-history/${supplierid}`,
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
      },
    }
  );
  return data;
};

export const PaymentSupplier = async (payload: {
  payment: number;
  itemid: string;
  currency: string;
}): Promise<SupplierHistoryItem[]> => {
  const { data } = await axios.post(
    `${NEXT_PUBLIC_API_URL}/supplier-payment`,
    payload,
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
      },
    }
  );

  return data;
};

export const CancelPaymentSupplier = async (payload: {
  historyid: string;
  itemid: string;
}): Promise<SupplierHistoryItem[]> => {
  const { data } = await axios.post(
    `${NEXT_PUBLIC_API_URL}/supplier-cancel-payment`,
    payload,
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
      },
    }
  );

  return data;
};

export const GetOrderSuppliers = async (folio:string): Promise<OrderSupplierGroup[]> => {
  const { data } = await axios.get(
    `${NEXT_PUBLIC_API_URL}/suppliers-by-folio/${folio}`,
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
      },
    }
  );

  return data;
};







