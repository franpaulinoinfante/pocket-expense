import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonButtons, IonBackButton 
} from '@ionic/angular/standalone';
import { Chart, registerables } from 'chart.js';
import { SqliteService } from '../../services/sqlite.service';

Chart.register(...registerables);

@Component({
  selector: 'app-graficos',
  templateUrl: './graficos.page.html',
  styleUrls: ['./graficos.page.scss'],
  standalone: true,
  imports: [
    CommonModule, IonHeader, IonToolbar, IonTitle, 
    IonContent, IonButtons, IonBackButton
  ]
})
export class GraficosPage {
  @ViewChild('barCanvas') barCanvas!: ElementRef;
  @ViewChild('pieCanvas') pieCanvas!: ElementRef;

  barChart: any;
  pieChart: any;

  constructor(private sqliteService: SqliteService) {}

  async ionViewDidEnter() {
    await this.cargarGraficos();
  }

  async cargarGraficos() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
      const datos = await this.sqliteService.getResumenFinanciero(Number(userId));
      const gastosPorCat = await this.sqliteService.getGastosPorCategoria(Number(userId));

      if (datos) {
        this.generarBarChart(datos.ingresos || 0, datos.gastos || 0);
      }
      
      if (gastosPorCat) {
        this.generarPieChart(gastosPorCat);
      }
    } catch (error) {
      console.error('Error al cargar datos para gráficos:', error);
    }
  }

  generarBarChart(ingresos: number, gastos: number) {
    if (this.barChart) this.barChart.destroy();

    this.barChart = new Chart(this.barCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Ingresos', 'Gastos'],
        datasets: [{
          data: [ingresos, gastos],
          backgroundColor: ['#34c759', '#ff3b30'], // Verde y Rojo iOS
          borderRadius: 8,
          barThickness: 50
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true, grid: { display: false } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  generarPieChart(datos: any[]) {
    if (this.pieChart) this.pieChart.destroy();

    this.pieChart = new Chart(this.pieCanvas.nativeElement, {
      type: 'doughnut', // Cambiado a dona para un look más moderno
      data: {
        labels: datos.map(d => d.categoria),
        datasets: [{
          data: datos.map(d => d.total),
          backgroundColor: [
            '#5856d6', '#af52de', '#ff9500', '#ffcc00', '#5ac8fa', '#007aff'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }
}