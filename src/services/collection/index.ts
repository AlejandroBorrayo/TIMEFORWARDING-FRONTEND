import axios from "axios";
import { PageMetaDto, PageOptionsDto } from "@/type/general";
import {
  CollectionCollectionInterface,
  CollectionCreateRequest,
  CollectionDatesInterface,
} from "@/type/collection";

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

export const FindAll = async (
  userid: string,
  pagination: PageOptionsDto,
  start_date?: Date,
  end_date?: Date,
  status?: string[]
): Promise<PageMetaDto<CollectionCollectionInterface>> => {
  const { data } = await axios.post(
    `${NEXT_PUBLIC_API_URL}/collection/all`,
    {
      userid,
      pagination,
      start_date,
      end_date,
      status,
    },
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
      },
    }
  );

  return data;
};

export const AvailableDatesSoloenvios = async (
  shipping_id: string
): Promise<CollectionDatesInterface> => {
  const { data } = await axios.get(
    `${NEXT_PUBLIC_API_URL}/soloenvios/collection-dates/${shipping_id}`,
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
      },
    }
  );

  return data;
};

export const AvailableDatesSkydropx = async (
  shipping_id: string
): Promise<CollectionDatesInterface> => {
  const { data } = await axios.get(
    `${NEXT_PUBLIC_API_URL}/skydropx/collection-dates/${shipping_id}`,
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
  body: CollectionCreateRequest
): Promise<CollectionCollectionInterface> => {
  const { data } = await axios.post(
    `${NEXT_PUBLIC_API_URL}/collection`,
    { userid, collection: body },
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
      },
    }
  );

  return data;
};

export const Find = async (
  id: string
): Promise<CollectionCollectionInterface> => {
  const { data } = await axios.get(`${NEXT_PUBLIC_API_URL}/collection/${id}`, {
    headers: {
      "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
    },
  });

  return data;
};
