export interface TransactionCollectionInterface {
  readonly _id?: string;
  readonly amount?: number;
  readonly reason?: string;
  readonly shipping?: any;
  readonly userid?: string;
  readonly deleted?: boolean;
  readonly created_at?: Date;
  readonly updated_at?: Date;
}
