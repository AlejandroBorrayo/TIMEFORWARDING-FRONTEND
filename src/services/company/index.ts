import axios from "axios";
import { withCompanyQuery } from "@/lib/withCompanyId";
import type { PageMetaDto, PageOptionsDto } from "@/type/general";
import type { CompanyFormPayload, CompanyInterface } from "@/type/company.interface";

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

const headers = {
  "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
};

/** Listado global: no envía company_id para poder cargar antes de elegir empresa. */
export const FindAll = async (
  pagination: PageOptionsDto,
  search?: string,
): Promise<PageMetaDto<CompanyInterface>> => {
  const { data } = await axios.post(
    `${NEXT_PUBLIC_API_URL}/company/all`,
    { pagination, search },
    { headers },
  );
  return data;
};

export const Find = async (id: string): Promise<CompanyInterface> => {
  const { data } = await axios.get(`${NEXT_PUBLIC_API_URL}/company/${id}`, {
    headers,
    params: withCompanyQuery(),
  });
  return data;
};

export const Create = async (
  body: CompanyFormPayload,
): Promise<CompanyInterface> => {
  const { data } = await axios.post(
    `${NEXT_PUBLIC_API_URL}/company`,
    body,
    { headers },
  );
  return data;
};

export const Update = async (
  id: string,
  body: CompanyFormPayload,
): Promise<CompanyInterface> => {
  const { data } = await axios.put(
    `${NEXT_PUBLIC_API_URL}/company/${id}`,
    body,
    { headers },
  );
  return data;
};
