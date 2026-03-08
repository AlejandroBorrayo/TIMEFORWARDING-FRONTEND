import axios from "axios";

export const ConvertCurrency = async (
  amount: number,
  from: string,
  to: string
): Promise<any> => {
  const { data } = await axios.get(
    `https://api.currencyfreaks.com/v2.0/rates/latest?apikey=2596121f5e6c4198909ac3af857b4e53&symbols=${from},${to}`
  );

  return data;
};
