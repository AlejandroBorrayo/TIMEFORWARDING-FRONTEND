import axios from "axios";
import type { TransactionCollectionInterface } from "@/type/transaction.interface";
import type { PageOptionsDto, PageMetaDto } from "@/type/general";
import type { CreateTransactionInterface } from "@/type/transaction.create.interface";

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

export const FindAll = async (
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
};

export const Create = async (
  userid: string,
  body: CreateTransactionInterface
): Promise<TransactionCollectionInterface> => {
  const { data } = await axios.post(
    `${NEXT_PUBLIC_API_URL}/transaction`,
    { ...body, userid },
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
      },
    }
  );

  return data;
};
