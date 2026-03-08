export interface ContactInterface {
  _id?:string
  name: string;
  email: string;
  phone?: string;
}

export interface CustomerInterface {
  _id:string
  contacts: ContactInterface[];
  company: string;
  company_rfc?: string;
  creator_userid: string;
  deleted: boolean;
  created_at?: Date;
  updated_at?: Date;
}