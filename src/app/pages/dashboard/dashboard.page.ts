import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
// Importamos todos los componentes que causaban error
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonGrid, IonRow, IonCol, IonButton, IonButtons,
  IonFooter, IonTabs, IonTabBar, IonTabButton,
  IonIcon, IonLabel
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons'; // Necesario para registrar los iconos
import { documentTextOutline, listOutline, pieChartOutline } from 'ionicons/icons';
import { SqliteService } from '../../services/sqlite.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonGrid, IonRow, IonCol, IonButton, IonButtons,
    IonFooter, IonTabs, IonTabBar, IonTabButton,
    IonIcon, IonLabel
  ]
})
export class DashboardPage implements OnInit {
  totalSaldo = 0;
  totalIngresos = 0;
  totalGastos = 0;

  constructor(
    private sqliteService: SqliteService,
    private router: Router
  ) {
    // Registramos los iconos para que se visualicen en el Tab Bar
    addIcons({ documentTextOutline, listOutline, pieChartOutline });
  }

  async ngOnInit() {
    await this.cargarDatos();
  }

  async ionViewWillEnter() {
    await this.cargarDatos();
  }
  

  async cargarDatos() {
    // 1. Obtener el ID del usuario logueado
    const userIdStr = localStorage.getItem('userId');

    if (!userIdStr) {
      // Si no hay usuario, redirigir al login por seguridad
      this.router.navigate(['/login']);
      return;
    }

    const userId = Number(userIdStr);

    try {
      // 2. Pasar el userId como argumento (esto quita el error TS2554)
      const resumen = await this.sqliteService.getResumenFinanciero(userId);

      if (resumen) {
        // 3. Asignar los valores (esto quita los errores TS2339)
        this.totalIngresos = resumen.ingresos;
        this.totalGastos = resumen.gastos;
        this.totalSaldo = resumen.balance;
      }
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    }
  }

  logout() {
    localStorage.removeItem('userId');
    this.router.navigate(['/login']);
  }

  // Para el botón de agregar si usaste (click)
  goToAddMovimiento(tipo: string) {
    console.log('Navegando a agregar:', tipo);
    // Navegamos a la ruta definida en app.routes.ts
    this.router.navigate(['/add-movimiento'], { queryParams: { tipo: tipo } });
  }
}