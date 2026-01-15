import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonGrid, IonRow, IonCol, IonButton, IonButtons,
  IonFooter, IonTabBar, IonTabButton,
  IonIcon, IonLabel
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons'; 
import { listOutline, pieChartOutline, personOutline, logOutOutline, documentTextOutline } from 'ionicons/icons';
import { SqliteService } from '../../services/sqlite.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonGrid, IonRow, IonCol, IonButton, IonButtons,
    IonFooter, IonTabBar, IonTabButton,
    IonIcon, IonLabel
  ]
})
export class DashboardPage implements OnInit {
  totalSaldo = 0;
  totalIngresos = 0;
  totalGastos = 0;

  constructor(
    private sqliteService: SqliteService,
    private router: Router,
    public authService: AuthService
  ) {
    addIcons({logOutOutline,listOutline,pieChartOutline,documentTextOutline,personOutline});
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
      this.router.navigate(['/login'], { replaceUrl: true });
      return;
    }

    const userId = Number(userIdStr);
    try {
      const resumen = await this.sqliteService.getResumenFinanciero(userId);
      if (resumen) {
        this.totalIngresos = resumen.ingresos || 0;
        this.totalGastos = resumen.gastos || 0;
        this.totalSaldo = resumen.balance || 0;
      }
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    }
  }

  goToAddMovimiento(tipo: string) {
    this.router.navigate(['/add-movimiento'], { queryParams: { tipo } });
  }

  goToPage(page: string) {
    this.router.navigate([`/${page}`]);
  }
}