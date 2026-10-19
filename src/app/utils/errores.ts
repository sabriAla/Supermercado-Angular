export function mensajeDeError(err: any): string {
  const cuerpo = err?.error;
  if (typeof cuerpo === 'string' && cuerpo) {
    try {
      const json = JSON.parse(cuerpo);
      if (json?.message) return json.message;
    } catch {
      return cuerpo;
    }
  }
  if (cuerpo?.message) return cuerpo.message;
  if (err?.status === 403) return 'No tenés permiso para hacer esto';
  if (err?.status === 0) return 'No se pudo conectar con el servidor';
  if (err?.status === 500) {
    return 'Error interno del servidor. Si estás confirmando una compra, levantá RabbitMQ (puerto 5672).';
  }
  return 'Ocurrió un error, intentá de nuevo';
}