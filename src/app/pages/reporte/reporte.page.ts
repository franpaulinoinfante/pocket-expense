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
  monthSelected: number = new Date().getMonth() + 1;
  yearSelected: number = new Date().getFullYear();
  movements: any[] = [];

  totalIncome = 0;
  totalExpenses = 0;
  monthlyBalance = 0;

  months = [
    { val: 1, nombre: 'Enero' }, { val: 2, nombre: 'Febrero' }, { val: 3, nombre: 'Marzo' },
    { val: 4, nombre: 'Abril' }, { val: 5, nombre: 'Mayo' }, { val: 6, nombre: 'Junio' },
    { val: 7, nombre: 'Julio' }, { val: 8, nombre: 'Agosto' }, { val: 9, nombre: 'Septiembre' },
    { val: 10, nombre: 'Octubre' }, { val: 11, nombre: 'Noviembre' }, { val: 12, nombre: 'Diciembre' }
  ];

  constructor(private sqliteService: SqliteService) { }

  async ngOnInit() {
    await this.displayReports();
  }

  async displayReports() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
      this.movements = await this.sqliteService.getMonthlyReport(
        Number(userId),
        this.monthSelected,
        this.yearSelected
      );
      this.calculateTotals();
    } catch (error) {
      console.error('Error cargando reporte:', error);
    }
  }

  calculateTotals() {
    this.totalIncome = this.movements
      .filter(m => m.tipo === 'INGRESO')
      .reduce((sum, m) => sum + m.monto, 0);

    this.totalExpenses = this.movements
      .filter(m => m.tipo === 'GASTO')
      .reduce((sum, m) => sum + m.monto, 0);

    this.monthlyBalance = this.totalIncome - this.totalExpenses;
  }
}