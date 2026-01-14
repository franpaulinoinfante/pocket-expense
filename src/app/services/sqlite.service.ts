import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';

@Injectable({
  providedIn: 'root',
})
export class SqliteService {

  private sqlite!: SQLiteConnection;
  private db!: SQLiteDBConnection;

  constructor() {
    if (Capacitor.getPlatform() === 'android') {
      this.sqlite = new SQLiteConnection((window as any).sqlitePlugin);
    }
  }

  async init() {
    if (Capacitor.getPlatform() !== 'android') {
      console.log('SQLite solo se inicializa en Android');
      return;
    }

    this.db = await this.sqlite.createConnection(
      'pocket_expense_db',
      false,
      'no-encryption',
      1,
      false
    );

    await this.db.open();
    await this.createTables();

    console.log('SQLite inicializado correctamente');
  }

  private async createTables() {
    const sql = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );
    `;

    await this.db.execute(sql);
    console.log('Tablas creadas o ya existentes');
  }
}
