import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, 
  IonBackButton, IonButton, IonIcon, IonList, IonItem, 
  IonLabel, IonThumbnail, IonSkeletonText, IonText, AlertController 
} from '@ionic/angular/standalone';
import { SqliteService } from '../../services/sqlite.service';
import { addIcons } from 'ionicons';
import { arrowUpOutline, arrowDownOutline, trashOutline, createOutline, closeCircleOutline } from 'ionicons/icons';
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
  movimientos: any[] = [];
  isLoading = true;
  editMode = false;

  constructor(
    private sqliteService: SqliteService,
    private alertCtrl: AlertController,
    public authService: AuthService
  ) {
    addIcons({ arrowUpOutline, arrowDownOutline, trashOutline, createOutline, closeCircleOutline });
  }

  async ngOnInit() {
    await this.cargarMovimientos();
  }

  async ionViewWillEnter() {
    await this.cargarMovimientos();
  }

  async cargarMovimientos() {
    this.isLoading = true;
    const userId = localStorage.getItem('userId');
    if (userId) {
      try {
        this.movimientos = await this.sqliteService.getMovimientos(Number(userId));
      } catch (error) {
        console.error('Error cargando movimientos:', error);
      }
    }
    // Efecto visual suave para la carga
    setTimeout(() => { this.isLoading = false; }, 500);
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
  }

  async confirmarEliminacion(mov: any) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar Registro',
      message: `¿Estás seguro de borrar "${mov.categoria_nombre}" por $${mov.monto}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            const success = await this.sqliteService.eliminarMovimiento(mov.id);
            if (success) {
              this.movimientos = this.movimientos.filter(m => m.id !== mov.id);
            }
          }
        }
      ]
    });
    await alert.present();
  }
}