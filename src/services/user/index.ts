import axios from "axios";
import { withCompanyId, withCompanyQuery } from "@/lib/withCompanyId";
import type { UserCollectionInterface } from "@/type/user.interface";
import { PageMetaDto } from "@/type/general";

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;
export const getUser = async (
  userid: string
): Promise<UserCollectionInterface> => {
  const { data } = await axios.get(`${NEXT_PUBLIC_API_URL}/user/${userid}`, {
    headers: {
      "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
    },
    params: withCompanyQuery(),
  });
  return data;
};

export const findAllUsers = async (
  userid: string,
  pagination: { page: number; perpage: number },
  search: string
): Promise<PageMetaDto<UserCollectionInterface>> => {
  const { data } = await axios.post(
    `${NEXT_PUBLIC_API_URL}/user/all`,
    withCompanyId({ userid, pagination, search }),
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
      },
    }
  );
  return data;
};

export const updateUser = async (
  userid: string,
  user?: Partial<UserCollectionInterface>
): Promise<UserCollectionInterface> => {
  const { data } = await axios.put(
    `${NEXT_PUBLIC_API_URL}/user/${userid}`,
    withCompanyId({ ...(user ?? {}) }),
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
      },
    }
  );
  return data;
};
export const inviteUser = async (
  name: string,
  email: string
): Promise<UserCollectionInterface> => {
  const { data } = await axios.post(
    `${NEXT_PUBLIC_API_URL}/invite`,
    withCompanyId({ name, email }),
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
      },
    }
  );
  return data;
};

export const register = async (
  invite: string,
  user: Partial<UserCollectionInterface>
): Promise<UserCollectionInterface> => {
  const { data } = await axios.post(
    `${NEXT_PUBLIC_API_URL}/invite/accept`,
    withCompanyId({ ...user, invite }),
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
      },
    }
  );
  return data;
};

