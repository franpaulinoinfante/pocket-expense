import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { APP_INITIALIZER } from '@angular/core'; // Importar esto

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { SqliteService } from './app/services/sqlite.service'; // Importar tu servicio

// Función para inicializar SQLite al arrancar
export function initializeApp(sqliteService: SqliteService) {
  return () => sqliteService.init();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes),
    // Agregar este proveedor para arrancar la base de datos
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [SqliteService],
      multi: true
    },
  ],
});