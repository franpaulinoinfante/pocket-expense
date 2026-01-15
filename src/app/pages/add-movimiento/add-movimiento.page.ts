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
  amount: number | null = null;
  categoryId: number = 0;
  date: string = new Date().toISOString();
  description: string = '';
  categories: any[] = [];
  types: 'INGRESO' | 'GASTO' = 'INGRESO';

  constructor(
    private sqliteService: SqliteService,
    private router: Router,
    private route: ActivatedRoute,
    private alertCtrl: AlertController
  ) { }

  async ngOnInit() {
    const tipoParam = this.route.snapshot.queryParamMap.get('tipo');
    if (tipoParam === 'GASTO' || tipoParam === 'INGRESO') {
      this.types = tipoParam;
    }
    await this.loadCategories();
  }

  async loadCategories() {
    try {
      this.categories = await this.sqliteService.getCategoruesByType(this.types);
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  }

  async addMovement() {
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
      this.router.navigate(['/login'], { replaceUrl: true });
      return;
    }
    if (!this.amount || this.amount <= 0 || !this.categoryId) {
      await this.displayAlert('Datos incompletos', 'Por favor, ingresa un monto válido y selecciona una categoría.');
      return;
    }
    try {
      const result = await this.sqliteService.addMovement(
        this.amount,
        this.date,
        this.description,
        this.categoryId,
        this.types,
        Number(userId)
      );

      if (result) {
        this.router.navigate(['/dashboard']);
      }
    } catch (error) {
      await this.displayAlert('Error', 'No se pudo guardar el movimiento. Revisa la conexión con la base de datos.');
    }
  }

  async displayAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['Aceptar']
    });
    await alert.present();
  }
}