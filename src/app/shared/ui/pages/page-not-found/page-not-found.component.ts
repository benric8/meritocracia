import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="not-found">
      <h1>404</h1>
      <p>Página no encontrada</p>
      <a routerLink="/">Volver al inicio</a>
    </section>
  `,
  styles: `
    .not-found {
      text-align: center;
      padding: 4rem 1rem;
    }
  `,
})
export class PageNotFoundComponent {}
