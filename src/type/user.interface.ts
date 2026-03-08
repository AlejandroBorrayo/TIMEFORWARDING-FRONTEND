export interface UserCollectionInterface {
  readonly _id?: string;
  readonly full_name: string;
  readonly email: string;
  readonly password?: string;
  readonly phone: string;
  readonly role: string;
  readonly commission: number;
  readonly type_commission: "percentage" | "amount";
  readonly deleted: boolean;
  readonly created_at: Date;
  readonly updated_at: Date;
}