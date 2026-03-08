import axios from "axios";
import type { taxCollectionInterface } from "@/type/tax.interface";
import type { PageOptionsDto, PageMetaDto } from "@/type/general";

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

export const FindAll = async (
  pagination: PageOptionsDto,
  search?:string
): Promise<PageMetaDto<taxCollectionInterface>> => {
  const { data } = await axios.post(
    `${NEXT_PUBLIC_API_URL}/tax/all`,
    {
      pagination,
    },
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
      },
    }
  );

  return data;
};

export const Find = async (noteid: string): Promise<taxCollectionInterface> => {
  const { data } = await axios.get(`${NEXT_PUBLIC_API_URL}/tax/${noteid}`, {
    headers: {
      "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
    },
  });

  return data;
};

export const UpdateTax = async (
  _id: string,
  payload: { name: string; amount: number }
): Promise<taxCollectionInterface> => {
  const { data } = await axios.put(
    `${NEXT_PUBLIC_API_URL}/tax/${_id}`,
    payload,
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
      },
    }
  );

  return data;
};

export const Update = UpdateTax;

export const Delete = async (_id: string): Promise<taxCollectionInterface> => {
  const { data } = await axios.put(
    `${NEXT_PUBLIC_API_URL}/tax/${_id}`,
    { deleted: true },
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
      },
    }
  );

  return data;
};

export const Create = async (payload: {
  name: string;
  amount: number;
}): Promise<taxCollectionInterface> => {
  const { data } = await axios.post(`${NEXT_PUBLIC_API_URL}/tax`, payload, {
    headers: {
      "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
    },
  });

  return data;
};
