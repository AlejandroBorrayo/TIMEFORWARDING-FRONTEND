import axios from "axios";
import type { QuoteDto } from "@/type/quote.dto";
import type {
  FolioCollectionInterface,
  QuoteByCustomerItem,
} from "@/type/folio.interface";

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

export const Create = async (
  body: QuoteDto,
): Promise<FolioCollectionInterface> => {
  const { data } = await axios.post(
    `${NEXT_PUBLIC_API_URL}/quote`,
    { ...body },
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
      },
    }
  );

  return data;
};

export const FindByCustomer = async (
  customerId: string,
  seller_id?: string,
): Promise<QuoteByCustomerItem[]> => {
  const params = seller_id ? `?seller_id=${seller_id}` : "";
  const { data } = await axios.get(
    `${NEXT_PUBLIC_API_URL}/quotes-by-customer/${customerId}${params}`,
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
      },
    }
  );

  return data;
};

export const CustomerPayment = async (payload: {
  payment: number;
  quoteid: string;
  currency: string;
}): Promise<unknown> => {
  const { data } = await axios.post(
    `${NEXT_PUBLIC_API_URL}/customer-payment`,
    payload,
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
      },
    }
  );
  return data;
};

export const CustomerCancelPayment = async (payload: {
  historyid: string;
  quoteid: string;
}): Promise<unknown> => {
  const { data } = await axios.post(
    `${NEXT_PUBLIC_API_URL}/customer-cancel-payment`,
    payload,
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
      },
    }
  );
  return data;
};

