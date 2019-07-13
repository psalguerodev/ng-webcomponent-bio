export interface BioVerifyRequest {
  tipoDocumento: string;
  numeroDocumento: string;
  indicadorDedo: string;
  indicadorCalidadDedo: string;
  huellaTemplate: string;
  tipoVerificacion: string;
  usuario: string;
  host: string;
  macCliente: string;
  ipCliente: string;
  numeroSolicitud: string;
  codigoTransaccion: string;
  codigoTienda: string;
  aplicacionOrigen: string;
  registroRF: string;
  dniAutorizador: string;
}
