import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonBackButton, IonItem, IonLabel, IonInput, IonSelect,
  IonSelectOption, IonModal, IonDatetime,
  IonTextarea, IonButton, AlertController
} from '@ionic/angular/standalone';
import { SqliteService } from '../../services/sqlite.service';

@Component({
  selector: 'app-add-movimiento',
  templateUrl: './add-movimiento.page.html',
  styleUrls: ['./add-movimiento.page.scss'],
  standalone: true,
  providers: [DatePipe],
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, 
    IonButtons, IonBackButton, IonItem, IonLabel, IonInput, IonSelect,
    IonSelectOption, IonModal, IonDatetime, IonTextarea, IonButton
  ]
})
export class AddMovimientoPage implements OnInit {
  monto: number | null = null;
  categoriaId: number = 0;
  fecha: string = new Date().toISOString();
  descripcion: string = '';
  categorias: any[] = [];
  tipo: 'INGRESO' | 'GASTO' = 'INGRESO';

  constructor(
    private sqliteService: SqliteService,
    private router: Router,
    private route: ActivatedRoute,
    private alertCtrl: AlertController
  ) { }

  async ngOnInit() {
    const tipoParam = this.route.snapshot.queryParamMap.get('tipo');
    if (tipoParam === 'GASTO' || tipoParam === 'INGRESO') {
      this.tipo = tipoParam;
    }
    await this.cargarCategorias();
  }

  async cargarCategorias() {
    try {
      this.categorias = await this.sqliteService.getCategoriasPorTipo(this.tipo);
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  }

  async guardar() {
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
      this.router.navigate(['/login'], { replaceUrl: true });
      return;
    }

    if (!this.monto || this.monto <= 0 || !this.categoriaId) {
      await this.mostrarAlerta('Datos incompletos', 'Por favor, ingresa un monto válido y selecciona una categoría.');
      return;
    }

    try {
      const res = await this.sqliteService.addMovimiento(
        this.monto,
        this.fecha,
        this.descripcion,
        this.categoriaId,
        this.tipo,
        Number(userId)
      );

      if (res) {
        this.router.navigate(['/dashboard']);
      }
    } catch (error) {
      await this.mostrarAlerta('Error', 'No se pudo guardar el movimiento. Revisa la conexión con la base de datos.');
    }
  }

  async mostrarAlerta(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['Aceptar']
    });
    await alert.present();
  }
}