export interface CreateTransactionInterface {
  amount: number;
  token?: string;
  userid: string;
  reason: string;
  byAdmin?:boolean;
  type?:string
  user_admin_id?:string
}