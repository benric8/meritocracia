import { setAppConfig } from './app-runtime-config';
import { AppRuntimeConfig } from './app-runtime-config.model';

const CONFIG_URL = 'assets/config.json';

/**
 * Carga `assets/config.json` antes del bootstrap.
 * Si falla, se mantienen los defaults de desarrollo.
 */
export async function cargarAppConfig(): Promise<void> {
  try {
    const respuesta = await fetch(CONFIG_URL, { cache: 'no-store' });

    if (!respuesta.ok) {
      throw new Error(`HTTP ${respuesta.status} al cargar ${CONFIG_URL}`);
    }

    const json = (await respuesta.json()) as Partial<AppRuntimeConfig>;
    setAppConfig(json);
  } catch (error) {
    console.error(
      `[config] No se pudo cargar ${CONFIG_URL}. Se usan valores por defecto de desarrollo.`,
      error
    );
  }
}
