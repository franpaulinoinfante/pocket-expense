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
    const resumen = await this.sqliteService.getResumenFinanciero();
    this.totalIngresos = resumen.ingresos;
    this.totalGastos = resumen.gastos;
    this.totalSaldo = resumen.balance;
  }

  logout() {
    localStorage.removeItem('userId');
    this.router.navigate(['/login']);
  }
}