import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 👈 Importante para el ngModel
import { Router } from '@angular/router';
import {
  IonContent, IonItem, IonInput, IonButton,
  IonText, IonIcon, AlertController
} from '@ionic/angular/standalone'; // 👈 Importar componentes específicos
import { addIcons } from 'ionicons'; // 👈 Para los iconos
import { closeOutline } from 'ionicons/icons';
import { SqliteService } from '../../services/sqlite.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,     // 👈 Agregar aquí para que funcione [(ngModel)]
    IonContent,      // 👈 Agregar todos los elementos de Ionic que uses
    IonItem,
    IonInput,
    IonButton,
    IonText,
    IonIcon
  ]
})
export class LoginPage {
  correo = '';
  contrasenia = '';

  constructor(
    private sqliteService: SqliteService,
    private router: Router,
    private alertCtrl: AlertController
  ) {
    // Registrar el icono de cerrar
    addIcons({ closeOutline });
  }

  async onLogin() {
    
    console.log('1. Intentando Login con:', this.correo);
    
    

    if (this.correo && this.contrasenia) {
      try {
        console.log('2. Esperando al servicio (isReady)...');
        const resultado = await this.sqliteService.loginUser(this.correo, this.contrasenia);

        console.log('3. Respuesta recibida:', resultado);

        if (resultado.success) {
          console.log('4. ÉXITO: Redirigiendo a Dashboard');
          localStorage.setItem('userId', resultado.user.id.toString());

          // Cambiamos 'home' por 'dashboard'
          this.router.navigate(['/dashboard']);
        } else {
          console.warn('4. FALLO:', resultado.message);
          const alert = await this.alertCtrl.create({
            header: 'Acceso Denegado',
            message: resultado.message,
            buttons: ['OK']
          });
          await alert.present();
        }
      } catch (e) {
        console.error('Error inesperado en login.page:', e);
      }
    } else {
      alert('Campos vacíos');
    }
  }

  goToDashboard()
  {
    this.router.navigate(['/dashboard']);
  }

  // 👈 Solución al error TS2339: Definir la función que falta
  goToWelcome() {
    // Puedes mandarlo al inicio o a una página de bienvenida
    this.router.navigate(['/register']);
  }

  // Función para ir al registro
  goToRegister() {
    this.router.navigate(['/register']);
  }
}