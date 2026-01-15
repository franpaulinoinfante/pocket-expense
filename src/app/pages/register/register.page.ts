import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonItem, IonInput, IonButton,
  IonText, IonIcon, IonHeader, IonToolbar, IonTitle
} from '@ionic/angular/standalone';
import { SqliteService } from '../../services/sqlite.service';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';
import { AlertController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonItem, IonInput, IonButton, IonText, IonIcon]
})
export class RegisterPage {
  nombre = '';
  correo = '';
  contrasenia = '';
  constructor(
    private sqliteService: SqliteService,
    private router: Router,
    private alertCtrl: AlertController // Inyectar
  ) {
    addIcons({ closeOutline });
  }

  async onRegister() {
    // 1. Verificar que no sean undefined antes de enviar
    if (!this.nombre || !this.correo || !this.contrasenia) {
      alert('Por favor rellena todos los campos');
      return;
    }

    try {
      const resultado = await this.sqliteService.registerUser(
        this.nombre,
        this.correo,
        this.contrasenia
      );

      if (resultado && resultado.success) {
        alert('¡Registro exitoso!');
        this.router.navigate(['/login']);
      } else {
        alert(resultado?.message || 'Error al registrar');
      }
    } catch (err) {
      console.error('Error en la llamada:', err);
      alert('Ocurrió un error inesperado');
    }
  }

  async displayAlert(title: string, message: string) {
    const alert = await this.alertCtrl.create({
      header: title,
      message: message,
      buttons: ['OK']
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

}