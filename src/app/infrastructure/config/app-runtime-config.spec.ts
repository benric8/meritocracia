import {
  APP_CONFIG_DEFAULTS,
  getAppConfig,
  resetAppConfig,
  setAppConfig,
} from './app-runtime-config';

describe('app-runtime-config', () => {
  afterEach(() => {
    resetAppConfig();
  });

  it('usa defaults al inicio', () => {
    expect(getAppConfig().urlApi).toBe(APP_CONFIG_DEFAULTS.urlApi);
  });

  it('fusiona overrides parciales sin perder el resto', () => {
    setAppConfig({ urlApi: 'https://prod.ejemplo/api/' });

    expect(getAppConfig().urlApi).toBe('https://prod.ejemplo/api/');
    expect(getAppConfig().codigoRol).toBe(APP_CONFIG_DEFAULTS.codigoRol);
    expect(getAppConfig().documentosInstitucionales.mimePermitido).toBe('application/pdf');
  });
});
