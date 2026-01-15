import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { SqliteService } from './services/sqlite.service';
import { Platform } from '@ionic/angular/standalone'; // 👈 Importar Platform

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true, // Asegúrate de tener esto si usas standalone components
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {

  constructor(
    private sqliteService: SqliteService,
    private platform: Platform // 👈 Inyectar Platform
  ) {
    this.initializeApp();
  }

  async ngOnInit() {
    // Ya no es estrictamente necesario si usamos APP_INITIALIZER en main.ts,
    // pero lo dejamos como segunda capa de seguridad.
  }

  private initializeApp() {
    this.platform.ready().then(async () => {
      console.log('Plataforma lista, inicializando base de datos...');
      await this.sqliteService.init();

      // 🛡️ REGLA DE ORO PARA TABLETS:
      // Si la app estaba minimizada y el usuario la vuelve a abrir,
      // nos aseguramos de que la conexión siga viva.
      this.platform.resume.subscribe(async () => {
        console.log('App recuperada del segundo plano (Resume)');
        await this.sqliteService.init();
      });
    });
  }
}