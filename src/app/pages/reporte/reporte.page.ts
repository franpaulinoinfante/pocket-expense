import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, 
  IonBackButton, IonGrid, IonRow, IonCol, IonItem, 
  IonSelect, IonSelectOption, IonText 
} from '@ionic/angular/standalone';
import { SqliteService } from '../../services/sqlite.service';

@Component({
  selector: 'app-reporte',
  templateUrl: './reporte.page.html',
  styleUrls: ['./reporte.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, 
    IonContent, IonButtons, IonBackButton, IonGrid, IonRow, 
    IonCol, IonItem, IonSelect, IonSelectOption, IonText
  ]
})
export class ReportePage implements OnInit {
  mesSeleccionado: number = new Date().getMonth() + 1;
  anioSeleccionado: number = new Date().getFullYear();
  movimientos: any[] = [];
  
  totalIngresos = 0;
  totalGastos = 0;
  balanceMensual = 0;

  meses = [
    { val: 1, nombre: 'Enero' }, { val: 2, nombre: 'Febrero' }, { val: 3, nombre: 'Marzo' },
    { val: 4, nombre: 'Abril' }, { val: 5, nombre: 'Mayo' }, { val: 6, nombre: 'Junio' },
    { val: 7, nombre: 'Julio' }, { val: 8, nombre: 'Agosto' }, { val: 9, nombre: 'Septiembre' },
    { val: 10, nombre: 'Octubre' }, { val: 11, nombre: 'Noviembre' }, { val: 12, nombre: 'Diciembre' }
  ];

  constructor(private sqliteService: SqliteService) {}

  async ngOnInit() {
    await this.cargarReporte();
  }

  async cargarReporte() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
      this.movimientos = await this.sqliteService.getReporteMensual(
        Number(userId), 
        this.mesSeleccionado, 
        this.anioSeleccionado
      );
      this.calcularTotales();
    } catch (error) {
      console.error('Error cargando reporte:', error);
    }
  }

  calcularTotales() {
    this.totalIngresos = this.movimientos
      .filter(m => m.tipo === 'INGRESO')
      .reduce((sum, m) => sum + m.monto, 0);

    this.totalGastos = this.movimientos
      .filter(m => m.tipo === 'GASTO')
      .reduce((sum, m) => sum + m.monto, 0);

    this.balanceMensual = this.totalIngresos - this.totalGastos;
  }
}