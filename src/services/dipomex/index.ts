import axios from "axios";
import { ResponseFindAddressByCP } from "@/type/dipomex";

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

export const FindAddress = async (
  postal_code: string
): Promise<ResponseFindAddressByCP> => {
  const { data } = await axios.post(
    `${NEXT_PUBLIC_API_URL}/dipomex
`,
    { postal_code },
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY || "",
      },
    }
  );

  return data;
};
