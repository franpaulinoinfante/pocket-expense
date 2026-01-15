import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { SQLiteConnection, SQLiteDBConnection, CapacitorSQLite } from '@capacitor-community/sqlite';

@Injectable({
  providedIn: 'root',
})
export class SqliteService {
  private sqlite!: SQLiteConnection;
  private db!: SQLiteDBConnection;
  private isReady: Promise<void>;
  private resolveReady!: () => void;
  private initialized = false;

  constructor() {
    this.isReady = new Promise((res) => { this.resolveReady = res; });
    if (Capacitor.getPlatform() === 'android') {
      this.sqlite = new SQLiteConnection(CapacitorSQLite);
    }
  }

  async init() {
    if (this.initialized) return;

    if (Capacitor.getPlatform() !== 'android') {
      console.warn('SQLite no disponible en navegador');
      this.initialized = true;
      this.resolveReady(); // 👈 Abrimos la llave aunque sea navegador para no bloquear la app
      return;
    }

    try {
      this.db = await this.sqlite.createConnection('pocket_expense_db', false, 'no-encryption', 1, false);
      await this.db.open();
      await this.createTables();
      this.initialized = true;
      this.resolveReady(); // ✅ Llave abierta en Android
      console.log('✅ SQLite Listo');
    } catch (error) {
      console.error('❌ Error Init:', error);
    }
  }

  async loginUser(correo: string, contrasenia: string) {
    await this.isReady;
    // IMPORTANTE: SELECT para consultar, no INSERT
    const sql = `SELECT * FROM usuarios WHERE correo = ? AND contrasenia = ? LIMIT 1`;
    try {
      const res = await this.db.query(sql, [correo, contrasenia]);
      if (res.values && res.values.length > 0) {
        return { success: true, user: res.values[0] };
      }
      return { success: false, message: 'Usuario no encontrado' };
    } catch (error: any) {
      return { success: false, message: 'Error: ' + error.message };
    }
  }

  async registerUser(nombre: string = '', correo: string = '', contrasenia: string = '') {
    await this.isReady;

    // Validación interna de seguridad
    if (!correo || !contrasenia) {
      return { success: false, message: 'Correo y contraseña son obligatorios' };
    }

    const sql = `INSERT INTO usuarios (nombre, correo, contrasenia) VALUES (?, ?, ?)`;
    try {
      await this.db.run(sql, [nombre, correo, contrasenia]);
      return { success: true, message: 'Registrado con éxito' };
    } catch (error: any) {
      console.error('Error en INSERT:', error);
      if (error.message.includes('UNIQUE')) {
        return { success: false, message: 'El correo ya existe' };
      }
      return { success: false, message: error.message || 'Error desconocido' };
    }
  }

  private async createTables() {
    // Sincronizado exactamente con tu script SQL
    const sql = `
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        correo TEXT NOT NULL UNIQUE,
        contrasenia TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS categorias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL UNIQUE,
        tipo TEXT NOT NULL CHECK (tipo IN ('INGRESO', 'GASTO'))
      );
      CREATE TABLE IF NOT EXISTS movimientos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        monto REAL NOT NULL,
        fecha TEXT NOT NULL,
        descripcion TEXT,
        categoria_id INTEGER,
        tipo TEXT NOT NULL,
        FOREIGN KEY(categoria_id) REFERENCES categorias(id)
      );
    `;
    await this.db.execute(sql);
  }
}