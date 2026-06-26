#!/usr/bin/env node
/**
 * Generador de estructura Clean Architecture para Angular 21+
 *
 * Convenciones:
 * - Componentes standalone, control flow @if/@for
 * - Estado UI con @ngrx/signals (signalStore), sin NgRx Store/Effects
 * - HTTP en infrastructure (Observable); signals en presentation
 * - Zoneless: provideZonelessChangeDetection() en app.config.ts
 * - Formularios: Signal Forms (@angular/forms/signals) cuando aplique
 *
 * Uso (después de ng new):
 *   node generate_clean_architecture.js --public
 *   node generate_clean_architecture.js --features=public,autenticacion,mantenimientos
 *   node generate_clean_architecture.js --features=admin --with-samples
 *   node generate_clean_architecture.js --help
 *
 * Alias legacy: --modulos=public,admin  (equivale a --features)
 */

const fs = require('fs');
const path = require('path');

const APP_ROOT = 'src/app';

// ---------------------------------------------------------------------------
// Utilidades de archivos
// ---------------------------------------------------------------------------

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`  + ${dir}`);
    return true;
  }
  console.log(`  ~ ${dir} (ya existe)`);
  return false;
};

const ensureDirs = (dirs) => dirs.forEach(ensureDir);

const writeFile = (filePath, content, { force = false } = {}) => {
  if (fs.existsSync(filePath) && !force) {
    console.log(`  ~ ${filePath} (conservado)`);
    return false;
  }
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`  > ${filePath}`);
  return true;
};

const touchGitkeep = (dir) => writeFile(path.join(dir, '.gitkeep'), '');

const toPascalCase = (value) =>
  value
    .trim()
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');

const toScreamingSnake = (value) =>
  value
    .trim()
    .replace(/[-\s]+/g, '_')
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toUpperCase();

const normalizeFeatureName = (name) =>
  name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

// ---------------------------------------------------------------------------
// Estructura núcleo (compartida por todos los modos)
// ---------------------------------------------------------------------------

const CORE_DIRS = [
  `${APP_ROOT}/domain/commons`,
  `${APP_ROOT}/domain/models`,
  `${APP_ROOT}/domain/dto/local`,
  `${APP_ROOT}/domain/dto/remote`,
  `${APP_ROOT}/domain/mappers`,

  `${APP_ROOT}/use-cases`,

  `${APP_ROOT}/infrastructure/security/encryption`,
  `${APP_ROOT}/infrastructure/security/guards`,
  `${APP_ROOT}/infrastructure/security/interceptors`,
  `${APP_ROOT}/infrastructure/repositories/local`,
  `${APP_ROOT}/infrastructure/repositories/remote`,

  `${APP_ROOT}/shared/ui/pages`,
  `${APP_ROOT}/shared/ui/components`,
  `${APP_ROOT}/shared/pipes`,
  `${APP_ROOT}/shared/directives`,
  `${APP_ROOT}/shared/utils`,

  `${APP_ROOT}/presentation/global-store`,
  `${APP_ROOT}/presentation/layouts`,
  `${APP_ROOT}/presentation/styles/base`,
  `${APP_ROOT}/presentation/styles/material`,
  `${APP_ROOT}/presentation/features`,

  'src/environments',
  'public/assets/img',
  'public/assets/i18n',
  'public/assets/resources',
  'docs',
];

const createCoreStructure = () => {
  console.log('\n[1/3] Carpetas núcleo (Angular 21 / Clean Architecture)');
  ensureDirs(CORE_DIRS);
};

// ---------------------------------------------------------------------------
// Plantillas de archivos base
// ---------------------------------------------------------------------------

const APP_STORE_TEMPLATE = `import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

interface AppState {
  mostrarCargando: boolean;
  menuUrlSeleccionada: string;
}

const initialState: AppState = {
  mostrarCargando: false,
  menuUrlSeleccionada: '',
};

export const AppStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    setMostrarCargando(estado: boolean): void {
      patchState(store, { mostrarCargando: estado });
    },
    seleccionarOpcionMenu(url: string): void {
      patchState(store, { menuUrlSeleccionada: url });
    },
  }))
);

export type AppStoreType = InstanceType<typeof AppStore>;
`;

const CONSTANTS_TEMPLATE = `/**
 * Constantes globales de dominio / aplicación.
 * Ajustar según contratos del backend.
 */
export const constantes = {
  RES_COD_EXITO: '0',
  RES_COD_NO_DATA: '1',
  JWT_TOKEN: 'jwt_token',
  JWT_TOKEN_NIVEL: 'jwt_token_nivel',
  DATETIME_NEW_TOKEN: 'datetime_new_token',
  TOKEN_VALID_SEC: 'token_valid_sec',
  REFRESH_TOKEN_VALID_SEC: 'refresh_token_valid_sec',
} as const;

export const tokenNiveles = {
  NIVEL_BASICO: 'BASICO',
  NIVEL_LOGIN: 'LOGIN',
  NIVEL_OPCIONES: 'OPCIONES',
} as const;

export const mensajes = {
  SWAL_TITLE_TOKEN_EXPIRA: 'Sesión expirada',
  MSG_RESP_NO_DATA: 'No se recibieron datos',
} as const;
`;

const SCSS_VARIABLES_TEMPLATE = `// Tokens SCSS del proyecto (complementan Material)
$color-primary: #8b0000;
$color-secondary: #932304;
`;

const SCSS_MIXINS_TEMPLATE = `// Mixins compartidos
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
`;

const ENV_TEMPLATE = `export const environment = {
  production: false,
  urlApi: 'https://api.ejemplo.gob.pe/',
  encrypPassword: 'cambiar-en-produccion-16+',
  encryptSalt: 'cambiar-salt-produccion',
  tokenCaptcha: '',
  linkExterno: 'www.ejemplo.gob.pe',
};
`;

const ENV_DEV_TEMPLATE = `export const environment = {
  production: false,
  urlApi: 'http://localhost:8080/',
  encrypPassword: 'dev-password-16chars',
  encryptSalt: 'dev-salt-value',
  tokenCaptcha: '',
  linkExterno: 'www.ejemplo.gob.pe',
};
`;

const PAGE_NOT_FOUND_TEMPLATE = `import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [RouterLink],
  template: \`
    <section class="not-found">
      <h1>404</h1>
      <p>Página no encontrada</p>
      <a routerLink="/">Volver al inicio</a>
    </section>
  \`,
  styles: \`
    .not-found {
      text-align: center;
      padding: 4rem 1rem;
    }
  \`,
})
export class PageNotFoundComponent {}
`;

const createBaseFiles = () => {
  console.log('\n[2/3] Archivos base (solo si no existen)');
  writeFile(`${APP_ROOT}/presentation/global-store/app.store.ts`, APP_STORE_TEMPLATE);
  writeFile(`${APP_ROOT}/domain/commons/constants.ts`, CONSTANTS_TEMPLATE);
  writeFile(`${APP_ROOT}/presentation/styles/base/_variables.scss`, SCSS_VARIABLES_TEMPLATE);
  writeFile(`${APP_ROOT}/presentation/styles/base/_mixins.scss`, SCSS_MIXINS_TEMPLATE);
  touchGitkeep(`${APP_ROOT}/presentation/styles/material`);
  writeFile('src/environments/environment.ts', ENV_TEMPLATE);
  writeFile('src/environments/environment.development.ts', ENV_DEV_TEMPLATE);
  writeFile(
    `${APP_ROOT}/shared/ui/pages/page-not-found/page-not-found.component.ts`,
    PAGE_NOT_FOUND_TEMPLATE
  );
  touchGitkeep('public/assets/img');
  touchGitkeep('public/assets/i18n');
  touchGitkeep('public/assets/resources');
};

// ---------------------------------------------------------------------------
// Features (antes "módulos")
// ---------------------------------------------------------------------------

const featureStoreTemplate = (featureName) => {
  const pascal = toPascalCase(featureName);
  const storeName = `${pascal}Store`;
  return `import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

interface ${pascal}State {
  // Definir estado del feature
  ejemplo: string | null;
}

const initialState: ${pascal}State = {
  ejemplo: null,
};

export const ${storeName} = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    setEjemplo(valor: string | null): void {
      patchState(store, { ejemplo: valor });
    },
  }))
);

export type ${pascal}StoreType = InstanceType<typeof ${storeName}>;
`;
};

const featureRoutesTemplate = (featureName) => {
  const pascal = toPascalCase(featureName);
  const routesConst = `${toScreamingSnake(featureName)}_ROUTES`;
  return `import { Routes } from '@angular/router';

/**
 * Rutas lazy del feature "${featureName}".
 * Registrar en app.routes.ts:
 *
 * {
 *   path: '${featureName}',
 *   loadChildren: () =>
 *     import('./presentation/features/${featureName}/routers/${featureName}.routes').then(
 *       (m) => m.${routesConst}
 *     ),
 * },
 */
export const ${routesConst}: Routes = [
  {
    path: '',
    // component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      // { path: 'inicio', loadComponent: () => import('../components/inicio/inicio.component').then(m => m.InicioComponent) },
      {
        path: '**',
        loadComponent: () =>
          import('../../../../shared/ui/pages/page-not-found/page-not-found.component').then(
            (m) => m.PageNotFoundComponent
          ),
      },
    ],
  },
];
`;
};

const featureReadmeTemplate = (featureName) => `# Feature: ${featureName}

Estructura Clean Architecture (Angular 21):

\`\`\`
presentation/features/${featureName}/
├── components/     # UI standalone
├── routers/        # Rutas lazy del feature
└── store/          # signalStore (@ngrx/signals), si aplica
\`\`\`

Capas relacionadas:
- \`domain/\` — modelos y DTOs
- \`use-cases/\` — reglas de negocio / orquestación
- \`infrastructure/repositories/\` — HTTP y persistencia local
`;

const createFeatureStructure = (featureName, withSamples) => {
  const normalized = normalizeFeatureName(featureName);
  if (!normalized) {
    console.warn(`  ! Feature ignorado (nombre inválido): "${featureName}"`);
    return;
  }

  const base = `${APP_ROOT}/presentation/features/${normalized}`;
  console.log(`\n  Feature: ${normalized}`);

  ensureDirs([
    `${base}/components`,
    `${base}/routers`,
    `${base}/store`,
  ]);

  writeFile(`${base}/routers/${normalized}.routes.ts`, featureRoutesTemplate(normalized));

  if (withSamples) {
    writeFile(`${base}/store/${normalized}.store.ts`, featureStoreTemplate(normalized));
  } else {
    touchGitkeep(`${base}/store`);
  }

  writeFile(`${base}/README.md`, featureReadmeTemplate(normalized));
};

const createPublicFeature = (withSamples) => {
  const base = `${APP_ROOT}/presentation/features/public`;
  ensureDirs([
    `${base}/components`,
    `${base}/routers`,
  ]);
  writeFile(`${base}/routers/public.routes.ts`, featureRoutesTemplate('public'));
  if (withSamples) {
    touchGitkeep(`${base}/components`);
  }
  writeFile(`${base}/README.md`, featureReadmeTemplate('public'));
};

// ---------------------------------------------------------------------------
// Modos de generación
// ---------------------------------------------------------------------------

const generatePublic = (withSamples) => {
  createCoreStructure();
  createBaseFiles();
  console.log('\n[3/3] Feature public (SPA simple)');
  createPublicFeature(withSamples);
  printPostInstallHints(['public']);
};

const generateFeatures = (features, withSamples) => {
  createCoreStructure();
  createBaseFiles();
  console.log('\n[3/3] Features');
  const unique = [...new Set(features.map(normalizeFeatureName).filter(Boolean))];
  unique.forEach((feature) => createFeatureStructure(feature, withSamples));
  printPostInstallHints(unique);
};

const printPostInstallHints = (features) => {
  console.log('\n--- Siguiente pasos (Angular 21) ---\n');
  console.log('1. Dependencias recomendadas:');
  console.log('   npm install @ngrx/signals sweetalert2 crypto-js');
  console.log('   npm install -D @types/crypto-js\n');
  console.log('2. app.config.ts — zoneless + HTTP:');
  console.log("   provideZonelessChangeDetection()");
  console.log('   provideHttpClient(withInterceptors([...]), withInterceptorsFromDi())\n');
  console.log('3. angular.json — build sin zone.js:');
  console.log('   "polyfills": []\n');
  console.log('4. Registrar rutas en app.routes.ts:');
  features.forEach((f) => {
    const routesConst = `${toScreamingSnake(f)}_ROUTES`;
    console.log(`   { path: '${f}', loadChildren: () => import('./presentation/features/${f}/routers/${f}.routes').then(m => m.${routesConst}) },`);
  });
  console.log('\n5. Generar componentes con CLI (standalone por defecto en v21):');
  console.log(`   ng g c presentation/features/<feature>/components/mi-pantalla --skip-tests\n`);
  console.log('6. Estado: usar signalStore en presentation/global-store o presentation/features/<feature>/store');
  console.log('   No crear carpetas actions/reducers/effects (NgRx legacy).\n');
};

const printHelp = () => {
  console.log(`
Generador Clean Architecture — Angular 21+

Uso:
  node generate_clean_architecture.js --public
  node generate_clean_architecture.js --features=public,autenticacion,mantenimientos
  node generate_clean_architecture.js --features=admin --with-samples
  node generate_clean_architecture.js --modulos=public,admin   (alias de --features)

Opciones:
  --public              Estructura núcleo + feature public (aplicación simple)
  --features=a,b,c      Lista de features (unidades funcionales / lazy routes)
  --modulos=a,b,c       Alias legacy de --features
  --with-samples        Genera signalStore de ejemplo por feature
  --help                Muestra esta ayuda

Estructura generada (resumen):
  src/app/domain/              Modelos, DTOs, constantes
  src/app/use-cases/           Casos de uso
  src/app/infrastructure/      Repositorios, guards, interceptors
  src/app/shared/              UI reutilizable, pipes, directivas
  src/app/presentation/        Layouts, global-store (signals), features/
`);
};

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const parseArgs = (argv) => {
  const options = {
    mode: null,
    features: [],
    withSamples: false,
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i].trim();
    if (arg === '--help' || arg === '-h') {
      options.mode = 'help';
      continue;
    }
    if (arg === '--public') {
      options.mode = 'public';
      continue;
    }
    if (arg === '--with-samples') {
      options.withSamples = true;
      continue;
    }
    if (arg.startsWith('--features=') || arg.startsWith('--modulos=')) {
      options.mode = 'features';
      const list = arg.split('=')[1] ?? '';
      options.features.push(
        ...list
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      );
      continue;
    }
    console.warn(`Parámetro no reconocido: ${arg}`);
  }

  return options;
};

const main = () => {
  const options = parseArgs(process.argv);

  if (options.mode === 'help' || !options.mode) {
    printHelp();
    if (!options.mode) {
      process.exitCode = 1;
    }
    return;
  }

  console.log('Generando estructura Clean Architecture para Angular 21...');

  if (options.mode === 'public') {
    generatePublic(options.withSamples);
  } else if (options.mode === 'features') {
    if (options.features.length === 0) {
      console.error('Error: indique al menos un feature. Ej: --features=public,admin');
      process.exitCode = 1;
      return;
    }
    generateFeatures(options.features, options.withSamples);
  }

  console.log('\nListo.');
};

main();
