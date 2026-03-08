import axios from "axios";
import type {
  QuotationSoloenviosRequest,
  Quotation,
} from "@/type/soloenvios-quote";
import { ShipmentSoloenviosRequest } from "@/type/soloenvios-shipment";
import { ShipmentCollectionInterface } from "@/type/shipment.interface";
import { PageMetaDto, PageOptionsDto } from "@/type/general";

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

/* export const FindAll = async (
  userid: string,
  pagination: PageOptionsDto,
  start_date?:Date,
  end_date?:Date,
): Promise<PageMetaDto<TransactionCollectionInterface>> => {
  const { data } = await axios.post(
    `${NEXT_PUBLIC_API_URL}/transaction/all`,
    {
      userid,
      pagination,
      start_date,
      end_date
    },
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
      },
    }
  );

  return data;
}; */

export const CreateQuoteSoloenvios = async (
  body: QuotationSoloenviosRequest
): Promise<Quotation> => {
  const { data } = await axios.post(`${NEXT_PUBLIC_API_URL}/soloenvios/quote`, body, {
    headers: {
      "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
    },
  });

  return data;
};

export const CreateQuoteSkydropx = async (
  body: QuotationSoloenviosRequest
): Promise<Quotation> => {
  const { data } = await axios.post(`${NEXT_PUBLIC_API_URL}/skydropx/quote`, body, {
    headers: {
      "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
    },
  });

  return data;
};


export const CreateShipmentSoloenvios = async (
  userid: string,
  body: ShipmentSoloenviosRequest,
  source:string
): Promise<ShipmentCollectionInterface> => {
  const { data } = await axios.post(
    `${NEXT_PUBLIC_API_URL}/shipment`,
    { userid, shipment: body, source },
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
      },
    }
  );

  return data;
};

export const FindShipment = async (
  id: string
): Promise<ShipmentCollectionInterface> => {
  const { data } = await axios.get(`${NEXT_PUBLIC_API_URL}/shipment/${id}`, {
    headers: {
      "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
    },
  });

  return data;
};

export const FindAllShipment = async (
  userid: string,
  pagination: PageOptionsDto,
  start_date?: Date,
  end_date?: Date,
  status?: string[],
  search?: string,
  collection_available?: boolean,
): Promise<PageMetaDto<ShipmentCollectionInterface>> => {
  const { data } = await axios.post(
    `${NEXT_PUBLIC_API_URL}/shipment/all`,
    {
      userid,
      pagination,
      search,
      start_date,
      end_date,
      status,
      collection_available
    },
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
      },
    }
  );

  return data;
};
