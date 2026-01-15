import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonGrid, IonRow, IonCol, IonButton, IonButtons,
  IonFooter, IonTabs, IonTabBar, IonTabButton,
  IonIcon, IonLabel
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons'; 
import { documentTextOutline, listOutline, pieChartOutline, personOutline } from 'ionicons/icons';
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
    addIcons({ personOutline, listOutline, pieChartOutline, documentTextOutline });
  }

  async ngOnInit() {
    await this.cargarDatos();
  }

  async ionViewWillEnter() {
    await this.cargarDatos();
  }


  async cargarDatos() {
    const userIdStr = localStorage.getItem('userId');

    if (!userIdStr) {
      this.router.navigate(['/login']);
      return;
    }

    const userId = Number(userIdStr);

    try {
      const resumen = await this.sqliteService.getResumenFinanciero(userId);

      if (resumen) {
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

  goToPage(page: string) {
    this.router.navigate([`/${page}`]);
  }

  goToAddMovimiento(tipo: string) {
    console.log('Navegando a agregar:', tipo);
    this.router.navigate(['/add-movimiento'], { queryParams: { tipo: tipo } });
  }
}