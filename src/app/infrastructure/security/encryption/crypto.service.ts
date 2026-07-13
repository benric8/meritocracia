import { Injectable } from '@angular/core';
import { Observable, from, map, catchError, of, switchMap, throwError } from 'rxjs';
import CryptoJS from 'crypto-js';
import { getAppConfig } from '../../config/app-runtime-config';

/**
 * Servicio robusto de encriptación/desencriptación con fallback automático
 *
 * Funcionalidades principales:
 * - Usa Web Crypto API (nativo) para entornos HTTPS
 * - Fallback automático a crypto-js en entornos HTTP o cuando Web Crypto API falla
 * - Encriptación AES-256-GCM con derivación de clave PBKDF2
 * - Manejo robusto de errores con observables
 */
@Injectable({
  providedIn: 'root'
})
export class CryptoService {

  private readonly encoder = new TextEncoder();
  private readonly decoder = new TextDecoder();

  // Configuración de encriptación - IMPORTANTE: Cambiar en producción
  // Idealmente estas claves deberían venir de variables de entorno
  private readonly password: string = this.getEncryptionPassword();
  private readonly saltString: string = this.getEncryptionSalt();
  private readonly salt: Uint8Array = this.encoder.encode(this.saltString);

  // Configuración de PBKDF2
  private readonly ITERATIONS = 100000;
  private readonly KEY_LENGTH = 256;
  private readonly IV_LENGTH = 12; // Para AES-GCM

  // Flag para detectar disponibilidad de Web Crypto API
  private isWebCryptoAvailable: boolean = this.checkWebCryptoAvailability();

  constructor() {
    this.logCryptoMode();
  }

  /**
   * Obtiene la contraseña de encriptación
   */
  private getEncryptionPassword(): string {
    const password = getAppConfig().encrypPassword;

    if (password.length < 16) {
      console.warn('La contraseña de encriptación es muy corta. Mínimo 16 caracteres.');
    }
    return password;
  }

  /**
   * Obtiene el salt de encriptación
   */
  private getEncryptionSalt(): string {
    return getAppConfig().encryptSalt;
  }

  /**
   * Verifica si Web Crypto API está disponible
   */
  private checkWebCryptoAvailability(): boolean {
    try {
      return !!(
        typeof window !== 'undefined' &&
        window.crypto &&
        window.crypto.subtle &&
        typeof window.crypto.subtle.encrypt === 'function'
      );
    } catch (error) {
      console.warn('Web Crypto API no disponible:', error);
      return false;
    }
  }

  /**
   * Registra el modo de encriptación actual
   */
  private logCryptoMode(): void {
    if (this.isWebCryptoAvailable) {
      console.log('CryptoService: Usando Web Crypto API (nativo)');
    } else {
      console.warn('CryptoService: Usando fallback crypto-js (Web Crypto API no disponible)');
    }
  }

  /**
   * Deriva una clave criptográfica usando PBKDF2 (Web Crypto API)
   */
  private deriveKey(): Observable<CryptoKey> {
    if (!this.password || !this.salt) {
      return throwError(() => new Error('Clave o salt no definidos correctamente'));
    }

    if (!this.isWebCryptoAvailable) {
      return throwError(() => new Error('Web Crypto API no disponible'));
    }

    const keyMaterial$ = from(
      window.crypto.subtle.importKey(
        'raw',
        this.encoder.encode(this.password),
        'PBKDF2',
        false,
        ['deriveKey']
      )
    );

    return keyMaterial$.pipe(
      switchMap(keyMaterial =>
        from(
          window.crypto.subtle.deriveKey(
            {
              name: 'PBKDF2',
              salt: this.salt.buffer as ArrayBuffer,
              iterations: this.ITERATIONS,
              hash: 'SHA-256',
            },
            keyMaterial,
            { name: 'AES-GCM', length: this.KEY_LENGTH },
            false,
            ['encrypt', 'decrypt']
          )
        )
      ),
      catchError(error => {
        console.error('Error derivando clave con Web Crypto API:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Encripta datos usando Web Crypto API
   */
  private encryptWithWebCrypto(data: any): Observable<string> {
    try {
      const encoded = this.encoder.encode(JSON.stringify(data));
      const iv = window.crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));

      return this.deriveKey().pipe(
        switchMap(key =>
          from(
            window.crypto.subtle.encrypt(
              { name: 'AES-GCM', iv },
              key,
              encoded
            )
          ).pipe(
            map(encrypted => {
              const encryptedArray = new Uint8Array(encrypted);
              const fullData = new Uint8Array(iv.length + encryptedArray.length);
              fullData.set(iv);
              fullData.set(encryptedArray, iv.length);
              return btoa(String.fromCharCode(...fullData));
            })
          )
        ),
        catchError(error => {
          console.error('Error en encriptación Web Crypto:', error);
          return throwError(() => error);
        })
      );
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Desencripta datos usando Web Crypto API
   */
  private decryptWithWebCrypto<T = any>(encryptedBase64: string): Observable<T | null> {
    try {
      const fullData = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
      const iv = fullData.slice(0, this.IV_LENGTH);
      const data = fullData.slice(this.IV_LENGTH);

      return this.deriveKey().pipe(
        switchMap(key =>
          from(
            window.crypto.subtle.decrypt(
              { name: 'AES-GCM', iv },
              key,
              data
            )
          ).pipe(
            map(decrypted => {
              const decoded = this.decoder.decode(decrypted);
              return JSON.parse(decoded) as T;
            })
          )
        ),
        catchError(error => {
          console.error('Error en desencriptación Web Crypto:', error);
          return throwError(() => error);
        })
      );
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Encripta datos usando crypto-js como fallback
   */
  private encryptWithCryptoJS(data: any): Observable<string> {
    try {
      const jsonString = JSON.stringify(data);

      // Generar una clave derivada con PBKDF2
      const key = CryptoJS.PBKDF2(this.password, this.saltString, {
        keySize: this.KEY_LENGTH / 32,
        iterations: this.ITERATIONS,
        hasher: CryptoJS.algo.SHA256
      });

      // Generar IV aleatorio
      const iv = CryptoJS.lib.WordArray.random(16);

      // Encriptar con AES-CBC (GCM no está disponible en crypto-js)
      const encrypted = CryptoJS.AES.encrypt(jsonString, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      // Combinar IV + datos encriptados
      const combined = iv.concat(encrypted.ciphertext);

      return of(combined.toString(CryptoJS.enc.Base64));
    } catch (error) {
      console.error('Error en encriptación crypto-js:', error);
      return throwError(() => new Error('Error al encriptar con crypto-js: ' + error));
    }
  }

  /**
   * Desencripta datos usando crypto-js como fallback
   */
  private decryptWithCryptoJS<T = any>(encryptedData: string): Observable<T | null> {
    try {
      // Generar la misma clave derivada con PBKDF2
      const key = CryptoJS.PBKDF2(this.password, this.saltString, {
        keySize: this.KEY_LENGTH / 32,
        iterations: this.ITERATIONS,
        hasher: CryptoJS.algo.SHA256
      });

      // Decodificar base64
      const combined = CryptoJS.enc.Base64.parse(encryptedData);
      // Extraer IV (primeros 16 bytes / 128 bits)
      const iv = CryptoJS.lib.WordArray.create(combined.words.slice(0, 4));

      // Extraer datos encriptados (resto)
      //const ciphertext = CryptoJS.lib.WordArray.create(combined.words.slice(4));
      // Es importante pasar el sigBytes para que no tome bytes de más
      const ciphertext = CryptoJS.lib.WordArray.create(
          combined.words.slice(4),
          combined.sigBytes - 16
      );
      // Desencriptar con AES-CBC
      const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: ciphertext } as any,
        key,
        {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        }
      );

      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);

      if (!decryptedString) {
        throw new Error('Desencriptación falló - resultado vacío');
      }
      return of(JSON.parse(decryptedString) as T);
    } catch (error) {
      console.error('Error en desencriptación crypto-js:', error);
      return of(null);
    }
  }

  /**
   * Encripta datos con fallback automático
   * Primero intenta con Web Crypto API, si falla usa crypto-js
   */
  encrypt(data: any): Observable<string> {
    console.log("encriptando", data);
    // Validaciones
    if (data === undefined || data === null) {
      return throwError(() => new Error('Los datos a encriptar no pueden ser null o undefined'));
    }

    if (this.isWebCryptoAvailable) {
      return this.encryptWithWebCrypto(data).pipe(
        catchError(error => {
          console.warn('Web Crypto falló, intentando con crypto-js fallback:', error);
          this.isWebCryptoAvailable = false; // Deshabilitar para futuras llamadas
          return this.encryptWithCryptoJS(data);
        })
      );
    } else {
      return this.encryptWithCryptoJS(data);
    }
  }

  /**
   * Desencripta datos con fallback automático
   * Primero intenta con Web Crypto API, si falla usa crypto-js
   */
  decrypt<T = any>(encryptedData: string): Observable<T | null> {
    console.log("desencriptando", encryptedData);
    // Validaciones
    if (!encryptedData || typeof encryptedData !== 'string') {
      console.error('Datos encriptados inválidos');
      return of(null);
    }

    if (this.isWebCryptoAvailable) {
      return this.decryptWithWebCrypto<T>(encryptedData).pipe(
        catchError(error => {
          console.warn('Web Crypto falló, intentando con crypto-js fallback:', error);
          this.isWebCryptoAvailable = false; // Deshabilitar para futuras llamadas
          return this.decryptWithCryptoJS<T>(encryptedData);
        })
      );
    } else {
      return this.decryptWithCryptoJS<T>(encryptedData);
    }
  }

  /**
   * Verifica si el servicio está usando Web Crypto API o el fallback
   */
  isUsingWebCrypto(): boolean {
    return this.isWebCryptoAvailable;
  }

  /**
   * Fuerza el uso del fallback crypto-js (útil para testing)
   */
  forceFallback(): void {
    console.warn('Forzando uso de crypto-js fallback');
    this.isWebCryptoAvailable = false;
  }

  /**
   * Intenta restaurar el uso de Web Crypto API
   */
  tryRestoreWebCrypto(): void {
    this.isWebCryptoAvailable = this.checkWebCryptoAvailability();
    this.logCryptoMode();
  }
}
