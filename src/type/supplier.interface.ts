export interface SupplierCollectionInterface {
  readonly _id?: string;
  readonly name: string;
  readonly email?: string;
  readonly phone?: string;
  readonly deleted?: boolean;
  readonly created_at?: Date;
  readonly updated_at?: Date;
}
