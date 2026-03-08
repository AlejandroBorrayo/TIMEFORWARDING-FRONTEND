import axios from "axios";
import type { SupplierCollectionInterface } from "@/type/supplier.interface";
import type { PageOptionsDto, PageMetaDto } from "@/type/general";

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;


export const FindAll = async (
  pagination: PageOptionsDto,
  search?: string
): Promise<PageMetaDto<SupplierCollectionInterface>> => {
  const { data } = await axios.post(
    `${NEXT_PUBLIC_API_URL}/supplier/all`,
    {
      pagination,
      search,
    },
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
      },
    }
  );

  return data;
};

export const Find = async (
  _id: string
): Promise<SupplierCollectionInterface> => {
  const { data } = await axios.get(
    `${NEXT_PUBLIC_API_URL}/supplier/${_id}`,
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
      },
    }
  );

  return data;
};

export const Update = async (
  customer_id: string,
  body: SupplierCollectionInterface
): Promise<SupplierCollectionInterface> => {
  const { data } = await axios.put(
    `${NEXT_PUBLIC_API_URL}/supplier/${customer_id}`,
    body,
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
      },
    }
  );

  return data;
};

export const Delete = async (
  customer_id: string
): Promise<SupplierCollectionInterface> => {
  const { data } = await axios.put(
    `${NEXT_PUBLIC_API_URL}/customer/${customer_id}`,
    { deleted: true },
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
      },
    }
  );

  return data;
};

export const Create = async (
  body: SupplierCollectionInterface,
): Promise<SupplierCollectionInterface> => {
  const { data } = await axios.post(
    `${NEXT_PUBLIC_API_URL}/supplier`,
    { ...body },
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
      },
    }
  );

  return data;
};
