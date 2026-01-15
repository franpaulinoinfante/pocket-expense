import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonItem, IonInput, IonButton,
  IonText, IonIcon, AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { SqliteService } from '../../services/sqlite.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonItem, IonInput, IonButton, IonText, IonIcon]
})
export class LoginPage {
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

  async onLogin() {
    if (!this.correo || !this.contrasenia) {
      await this.displayAlert('Campos vacíos', 'Por favor ingresa tus credenciales.');
      return;
    }

    try {
      const resultado = await this.sqliteService.loginUser(this.correo, this.contrasenia);

      if (resultado.success && resultado.user) {
        localStorage.setItem('userId', resultado.user.id.toString());
        this.router.navigate(['/dashboard'], { replaceUrl: true });
      } else {
        await this.displayAlert('Acceso Denegado', resultado.message || 'Credenciales inválidas');
      }
    } catch (e) {
      console.error('Error en login:', e);
      await this.displayAlert('Error', 'Ocurrió un error inesperado al conectar con la base de datos.');
    }
  }

  async displayAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}