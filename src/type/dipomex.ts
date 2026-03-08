export interface ResponseFindAddressByCP {
  error: boolean;
  message: string;
  codigo_postal: {
    estado: string;
    estado_abreviatura: string;
    municipio: string;
    centro_reparto: string;
    codigo_postal: string;
    colonias: string[];
  };
}