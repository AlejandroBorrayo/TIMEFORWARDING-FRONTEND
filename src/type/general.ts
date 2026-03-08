

export interface PageOptionsDto {
  page?: number;
  perpage?: number;
}

export interface PageMetaDtoParameters {
  pageOptions: PageOptionsDto;
  total: number;
  records: any[];
}

export class PageMetaDto<T> {
  readonly page: number;
  readonly perpage: number;
  readonly total: number;
  readonly totalpages: number;
  readonly records: T[];

  constructor({ pageOptions, total, records }: PageMetaDtoParameters) {
    this.page = pageOptions?.page ?? 1;
    this.perpage = pageOptions?.perpage ?? 10;
    this.total = total;
    this.totalpages = Math.ceil(this.total / this.perpage);
    this.records = records;
  }
}
