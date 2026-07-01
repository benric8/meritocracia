import { Injectable } from '@angular/core';
import CryptoJS from 'crypto-js';
import { environment } from '../../../../environments/environment';

const PREFIJO_CIFRADO = 'ENC1:';

/** Descifrado síncrono reutilizable (hidratación inicial del store sin DI). */
export function descifrarValorSesionAlmacenado(valor: string | null): string | null {
  if (!valor) {
    return null;
  }
  if (!valor.startsWith(PREFIJO_CIFRADO)) {
    return valor;
  }
  try {
    const bytes = CryptoJS.AES.decrypt(valor.slice(PREFIJO_CIFRADO.length), environment.encrypPassword);
    const texto = bytes.toString(CryptoJS.enc.Utf8);
    return texto || null;
  } catch {
    return null;
  }
}

/**
 * Cifrado síncrono ligero para campos de sesión en localStorage
 * (nivel de token, código y nombre de usuario).
 */
@Injectable({ providedIn: 'root' })
export class SessionFieldCryptoService {
  private readonly prefijo = PREFIJO_CIFRADO;
  private readonly clave = environment.encrypPassword;

  cifrar(valor: string): string {
    if (!valor) {
      return valor;
    }
    const cifrado = CryptoJS.AES.encrypt(valor, this.clave).toString();
    return `${this.prefijo}${cifrado}`;
  }

  descifrar(valor: string | null): string | null {
    return descifrarValorSesionAlmacenado(valor);
  }
}
