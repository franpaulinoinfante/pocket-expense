import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, 
  IonBackButton, IonButton, IonIcon, IonList, IonItem, 
  IonLabel, IonThumbnail, IonSkeletonText, IonText, AlertController 
} from '@ionic/angular/standalone';
import { SqliteService } from '../../services/sqlite.service';
import { addIcons } from 'ionicons';
// Se agrega 'trash' a los imports para que coincida con tu addIcons y tu HTML
import { 
  arrowUpOutline, 
  arrowDownOutline, 
  trash, 
  trashOutline, 
  createOutline, 
  closeCircleOutline, 
  receiptOutline 
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-movimientos',
  templateUrl: './movimientos.page.html',
  styleUrls: ['./movimientos.page.scss'],
  standalone: true,
  imports: [
    CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, 
    IonBackButton, IonButton, IonIcon, IonList, IonItem, 
    IonLabel, IonThumbnail, IonSkeletonText, IonText
  ]
})
export class MovimientosPage implements OnInit {
  movements: any[] = [];
  isLoading = true;
  editMode = false;

  constructor(
    private sqliteService: SqliteService,
    private alertCtrl: AlertController,
    public authService: AuthService
  ) {
    // CORRECCIÓN: Ahora 'trash' sí existe porque lo importamos arriba
    addIcons({
      trash,
      trashOutline,
      receiptOutline,
      arrowUpOutline,
      arrowDownOutline,
      createOutline,
      closeCircleOutline
    });
  }

  async ngOnInit() {
    await this.displayMovements();
  }

  async ionViewWillEnter() {
    await this.displayMovements();
  }

  async displayMovements() {
    this.isLoading = true;
    const userId = localStorage.getItem('userId');
    if (userId) {
      try {
        this.movements = await this.sqliteService.getMovementsByUserId(Number(userId));
      } catch (error) {
        console.error('Error cargando movimientos:', error);
      }
    }
    setTimeout(() => { this.isLoading = false; }, 500);
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
  }

  async removeMovement(movement: any) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar Registro',
      message: `¿Estás seguro de borrar "${movement.categoria_nombre}" por $${movement.monto}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            const success = await this.sqliteService.removeMovement(movement.id);
            if (success) {
              this.movements = this.movements.filter(m => m.id !== movement.id);
            }
          }
        }
      ]
    });
    await alert.present();
  }
}