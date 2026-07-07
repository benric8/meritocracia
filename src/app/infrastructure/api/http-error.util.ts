import { HttpErrorResponse } from '@angular/common/http';

export function mensajeErrorHttp(error: unknown, mensajePorDefecto: string): string {
  if (error instanceof HttpErrorResponse) {
    const cuerpo = error.error as { descripcion?: string; message?: string } | null;
    return cuerpo?.descripcion ?? cuerpo?.message ?? mensajePorDefecto;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return mensajePorDefecto;
}
