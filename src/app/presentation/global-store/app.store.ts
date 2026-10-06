import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

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
