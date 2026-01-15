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
  balanceIncome = 0;
  totalIncome = 0;
  incomeExpenses = 0;

  constructor(
    private sqliteService: SqliteService,
    private router: Router,
    public authService: AuthService
  ) {
    addIcons({logOutOutline,listOutline,pieChartOutline,documentTextOutline,personOutline});
  }

  async ngOnInit() {
    await this.loadData();
  }

  async ionViewWillEnter() {
    await this.loadData();
  }

  async loadData() {
    const userIdStr = localStorage.getItem('userId');
    if (!userIdStr) {
      this.router.navigate(['/login'], { replaceUrl: true });
      return;
    }
    const userId = Number(userIdStr);
    try {
      const summary = await this.sqliteService.getFinancialSummaryByUserId(userId);
      if (summary) {
        this.totalIncome = summary.income || 0;
        this.incomeExpenses = summary.expenses || 0;
        this.balanceIncome = summary.balance || 0;
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