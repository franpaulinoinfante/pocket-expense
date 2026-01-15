import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router'; // 👈 Asegurar ambos aquí
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonBackButton, IonItem, IonLabel, IonInput, IonSelect,
  IonSelectOption, IonModal, IonDatetime,
  IonTextarea, IonButton
} from '@ionic/angular/standalone';
import { SqliteService } from '../../services/sqlite.service';

@Component({
  selector: 'app-add-movimiento',
  templateUrl: './add-movimiento.page.html',
  styleUrls: ['./add-movimiento.page.scss'],
  standalone: true,
  providers: [DatePipe],
  imports: [
    CommonModule,
    FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonBackButton, IonItem, IonLabel, IonInput, IonSelect,
    IonSelectOption, IonModal, IonDatetime,
    IonTextarea, IonButton
  ]
})
export class AddMovimientoPage implements OnInit {
  monto: number = 0;
  categoriaId: number = 0;
  fecha: string = new Date().toISOString();
  descripcion: string = '';
  categorias: any[] = [];
  tipo: 'INGRESO' | 'GASTO' = 'INGRESO'; // 👈 Variable para controlar el tipo

  constructor(
    private sqliteService: SqliteService,
    private router: Router,
    private route: ActivatedRoute // 👈 1. Inyectar ActivatedRoute
  ) { }

  async ngOnInit() {
    // 2. Leer el parámetro 'tipo' que viene del Dashboard
    const tipoParam = this.route.snapshot.queryParamMap.get('tipo');
    if (tipoParam === 'GASTO' || tipoParam === 'INGRESO') {
      this.tipo = tipoParam;
    }

    // 3. Cargar categorías filtradas por ese tipo
    await this.cargarCategorias();
  }

  async cargarCategorias() {
    this.categorias = await this.sqliteService.getCategoriasPorTipo(this.tipo);
    console.log(`Categorías de ${this.tipo} cargadas:`, this.categorias);
  }

  async guardar() {
    const userId = localStorage.getItem('userId');

    // 1. Validaciones básicas
    if (!userId) {
      alert('Sesión no encontrada. Por favor inicie sesión de nuevo.');
      this.router.navigate(['/login']);
      return;
    }

    if (this.monto <= 0 || !this.categoriaId) {
      alert('Por favor, ingrese un monto válido y seleccione una categoría.');
      return;
    }

    try {
      // 2. Ejecutar la inserción en la base de datos
      const res = await this.sqliteService.addMovimiento(
        this.monto,
        this.fecha,
        this.descripcion,
        this.categoriaId,
        this.tipo,
        Number(userId)
      );

      // 3. Si tuvo éxito, volver al Dashboard
      // Nota: addMovimiento en tu servicio devuelve el resultado de db.run()
      if (res) {
        console.log('✅ Movimiento guardado con éxito');
        this.router.navigate(['/dashboard']);
      }
    } catch (error) {
      console.error('❌ Error al guardar:', error);
      alert('No se pudo guardar el movimiento.');
    }
  }
}