import axios from "axios";
import type { CustomerInterface } from "@/type/customer.interface";
import type { PageOptionsDto, PageMetaDto } from "@/type/general";
import {  CustomerForm } from "@/components/createCustomerModal";

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;


export const FindAll = async (
  pagination: PageOptionsDto,
  search?: string
): Promise<PageMetaDto<CustomerInterface>> => {
  const { data } = await axios.post(
    `${NEXT_PUBLIC_API_URL}/customer/all`,
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
): Promise<CustomerInterface> => {
  const { data } = await axios.get(
    `${NEXT_PUBLIC_API_URL}/customer/${_id}`,
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
  body: CustomerForm
): Promise<CustomerInterface> => {
  const { data } = await axios.put(
    `${NEXT_PUBLIC_API_URL}/customer/${customer_id}`,
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
): Promise<CustomerInterface> => {
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
  body: CustomerForm,
): Promise<CustomerInterface> => {
  const { data } = await axios.post(
    `${NEXT_PUBLIC_API_URL}/customer`,
    { ...body },
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
      },
    }
  );

  return data;
};
