import axios from "axios";

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;
export const login = async (email: string, password: string) => {
  const { data } = await axios.post(`${NEXT_PUBLIC_API_URL}/auth/login`, {
    email,
    password,
  }, {
    headers: {
      "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY, 
    },
  });
  return data;
};


export const recoveryPassword = async (email: string) => {
  const { data } = await axios.post(`${NEXT_PUBLIC_API_URL}/auth/recovery-password`, {
    email,
  }, {
    headers: {
      "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY, 
    },
  });
  return data;
};

export const resetPassword = async (token: string,new_password:string) => {
  const { data } = await axios.post(`${NEXT_PUBLIC_API_URL}/auth/reset-password`, {
    new_password,
    token
  }, {
    headers: {
      "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY, 
    },
  });
  return data;
};




