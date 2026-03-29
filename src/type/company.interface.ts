export interface CompanyInterface {
  _id: string;
  name: string;
  logo?: string;
}

export type CompanyFormPayload = {
  name: string;
  logo?: string;
};
