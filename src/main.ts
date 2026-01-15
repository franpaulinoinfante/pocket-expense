import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withComponentInputBinding } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { APP_INITIALIZER, importProvidersFrom } from '@angular/core';

// IMPORTANTE: Importar cargadores de elementos web
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { JeepSqlite } from 'jeep-sqlite/dist/components/jeep-sqlite';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { SqliteService } from './app/services/sqlite.service';

// Inicializar elementos web antes del arranque de Angular
customElements.define('jeep-sqlite', JeepSqlite);
defineCustomElements(window);

export function initializeApp(sqliteService: SqliteService) {
  return () => sqliteService.init();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withComponentInputBinding()), // Recomendado para leer parámetros de URL
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [SqliteService],
      multi: true
    },
  ],
});