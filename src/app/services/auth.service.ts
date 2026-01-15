import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private alertCtrl: AlertController, private router: Router) {
    addIcons({ logOutOutline });
  }

  async confirmarLogout() {
    const alert = await this.alertCtrl.create({
      header: 'Cerrar Sesión',
      message: '¿Estás seguro de que deseas salir?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Salir',
          role: 'destructive',
          handler: () => {
            localStorage.removeItem('userId'); // Limpia la sesión
            this.router.navigate(['/login'], { replaceUrl: true }); // Redirige
          }
        }
      ]
    });
    await alert.present();
  }
}