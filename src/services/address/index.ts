import axios from "axios";
import type { AddressCollectionInterface } from "@/type/address.interface";
import type { PageOptionsDto, PageMetaDto } from "@/type/general";

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

export const FindAll = async (
  userid: string,
  pagination: PageOptionsDto,
  search?: string
): Promise<PageMetaDto<AddressCollectionInterface>> => {
  const { data } = await axios.post(
    `${NEXT_PUBLIC_API_URL}/address/all`,
    {
      userid,
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
  addressid: string
): Promise<AddressCollectionInterface> => {
  const { data } = await axios.get(
    `${NEXT_PUBLIC_API_URL}/address/${addressid}`,
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
      },
    }
  );

  return data;
};

export const Update = async (
  addressid: string,
  body: AddressCollectionInterface
): Promise<AddressCollectionInterface> => {
  const { data } = await axios.put(
    `${NEXT_PUBLIC_API_URL}/address/${addressid}`,
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
  addressid: string
): Promise<AddressCollectionInterface> => {
  const { data } = await axios.put(
    `${NEXT_PUBLIC_API_URL}/address/${addressid}`,
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
  userid: string,
  body: AddressCollectionInterface
): Promise<AddressCollectionInterface> => {
  const { data } = await axios.post(
    `${NEXT_PUBLIC_API_URL}/address`,
    { userid, ...body },
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
      },
    }
  );

  return data;
};
