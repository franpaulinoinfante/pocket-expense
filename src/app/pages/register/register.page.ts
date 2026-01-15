import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonItem, IonInput, IonButton,
  IonText, IonIcon
} from '@ionic/angular/standalone';
import { SqliteService } from '../../services/sqlite.service';
import { addIcons } from 'ionicons';
import { closeOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons';
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
  showPassword = false;

  constructor(
    private sqliteService: SqliteService,
    private router: Router,
    private alertCtrl: AlertController
  ) {
    addIcons({ closeOutline, eyeOutline, eyeOffOutline });
  }

  async onRegister() {
    if (!this.nombre || !this.correo || !this.contrasenia) {
      await this.displayAlert('Campos incompletos', 'Por favor rellena todos los campos para continuar.');
      return;
    }
    try {
      const resultado = await this.sqliteService.registerUser(
        this.nombre,
        this.correo,
        this.contrasenia
      );
      if (resultado && resultado.success) {
        await this.displayAlert('¡Éxito!', 'Tu cuenta ha sido creada correctamente.');
        this.router.navigate(['/login']);
      } else {
        await this.displayAlert('Error', resultado?.message || 'No se pudo completar el registro.');
      }
    } catch (err) {
      console.error('Error en registro:', err);
      await this.displayAlert('Error Crítico', 'Ocurrió un error inesperado al conectar con la base de datos.');
    }
  }

  async displayAlert(title: string, message: string) {
    const alert = await this.alertCtrl.create({
      header: title,
      message: message,
      buttons: ['Aceptar']
    });
    await alert.present();
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}