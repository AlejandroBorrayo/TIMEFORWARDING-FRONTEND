import axios from "axios";
import { withCompanyId } from "@/lib/withCompanyId";
import { PageMetaDto, PageOptionsDto } from "@/type/general";
import {
  CartaporteCollectionInterface,
} from "@/type/cartaporte.interface";

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

export const FindAll = async (
  search: string,
  pagination: PageOptionsDto,
): Promise<PageMetaDto<CartaporteCollectionInterface>> => {
  const { data } = await axios.post(
    `${NEXT_PUBLIC_API_URL}/cartaporte/all`,
    withCompanyId({
      search,
      pagination,
    }),
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
      },
    }
  );

  return data;
};
