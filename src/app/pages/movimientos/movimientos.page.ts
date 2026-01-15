import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SqliteService } from '../../services/sqlite.service';
import { addIcons } from 'ionicons'; 
import { arrowUpOutline, arrowDownOutline } from 'ionicons/icons';

@Component({
  selector: 'app-movimientos',
  templateUrl: './movimientos.page.html',
  styleUrls: ['./movimientos.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class MovimientosPage implements OnInit {
  movimientos: any[] = [];
  isLoading = true;

  constructor(private sqliteService: SqliteService) {
    addIcons({ arrowUpOutline, arrowDownOutline });
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
    setTimeout(() => {
      this.isLoading = false;
    }, 400);
  }
}