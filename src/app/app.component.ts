import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { SqliteService } from './services/sqlite.service';
import { Platform } from '@ionic/angular/standalone'; // 👈 Importar Platform

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
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
  }

  private initializeApp() {
    this.platform.ready().then(async () => {
      console.log('Plataforma lista, inicializando base de datos...');
      await this.sqliteService.init();

      this.platform.resume.subscribe(async () => {
        console.log('App recuperada del segundo plano (Resume)');
        await this.sqliteService.init();
      });
    });
  }
}