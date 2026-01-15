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

  // 1. Detectar plataforma
  const platform = Capacitor.getPlatform();

  if (platform === 'web') {
    console.log('Corriendo en Navegador: Modo Desarrollo');
    // Aquí podrías configurar jeep-sqlite si quieres persistencia en web
    this.initialized = true;
    this.resolveReady();
    return;
  }

  // 2. Lógica para Dispositivos (Android/iOS)
  try {
    const connections = await this.sqlite.isConnection('pocket_expense_db', false);

    if (connections.result) {
      this.db = await this.sqlite.retrieveConnection('pocket_expense_db', false);
    } else {
      this.db = await this.sqlite.createConnection('pocket_expense_db', false, 'no-encryption', 1, false);
    }

    await this.db.open();
    await this.createTables(); // Asegura que las tablas existan en el nuevo dispositivo
    
    this.initialized = true;
    this.resolveReady();
    console.log('Base de datos inicializada en dispositivo móvil');
  } catch (error) {
    console.error('Error inicializando SQLite en móvil:', error);
  }
}

  // async init() {
  //   if (this.initialized) return;

  //   if (Capacitor.getPlatform() !== 'android') {
  //     this.initialized = true;
  //     this.resolveReady();
  //     return;
  //   }
  //   try {
  //     const connections = await this.sqlite.isConnection('pocket_expense_db', false);

  //     if (connections.result) {
  //       this.db = await this.sqlite.retrieveConnection('pocket_expense_db', false);
  //     } else {
  //       this.db = await this.sqlite.createConnection('pocket_expense_db', false, 'no-encryption', 1, false);
  //     }

  //     const isOpen = await this.db.isDBOpen();
  //     if (!isOpen.result) {
  //       await this.db.open();
  //     }

  //     await this.createTables();
  //     this.initialized = true;
  //     this.resolveReady();
  //     console.log('✅ SQLite Sincronizado correctamente');
  //   } catch (error) {
  //     console.error('❌ Error crítico en Init:', error);
  //   }
  // }

  async loginUser(correo: string, contrasenia: string) {
    await this.isReady;
    const sql = `SELECT id, nombre, correo FROM usuarios WHERE correo = ? AND contrasenia = ? LIMIT 1`;
    try {
      const res = await this.db.query(sql, [correo, contrasenia]);
      if (res.values && res.values.length > 0) {
        return { success: true, user: res.values[0] };
      }
      return { success: false, message: 'Credenciales incorrectas' };
    } catch (error: any) {
      return { success: false, message: 'Error de conexión' };
    }
  }

  async registerUser(nombre: string = '', correo: string = '', contrasenia: string = '') {
    await this.isReady;

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

  async getResumenFinanciero(usuario_id: number) {
    await this.isReady;
    try {
      const ingresosRes = await this.db.query(
        `SELECT SUM(monto) as total FROM movimientos WHERE tipo = 'INGRESO' AND usuario_id = ?`,
        [usuario_id]
      );
      const gastosRes = await this.db.query(
        `SELECT SUM(monto) as total FROM movimientos WHERE tipo = 'GASTO' AND usuario_id = ?`,
        [usuario_id]
      );

      const ingresos = ingresosRes.values?.[0]?.total || 0;
      const gastos = gastosRes.values?.[0]?.total || 0;

      return {
        ingresos: ingresos,
        gastos: gastos,
        balance: ingresos - gastos
      };
    } catch (error) {
      console.error('Error al calcular balance:', error);
      return { ingresos: 0, gastos: 0, balance: 0 };
    }
  }

  async getMovimientos(usuario_id: number) {
    await this.isReady;
    const sql = `
    SELECT m.*, c.nombre as categoria_nombre 
    FROM movimientos m
    LEFT JOIN categorias c ON m.categoria_id = c.id
    WHERE m.usuario_id = ? -- 👈 Filtrar por usuario
    ORDER BY m.fecha DESC`;
    const res = await this.db.query(sql, [usuario_id]);
    return res.values || [];
  }

  async addMovimiento(monto: number, fecha: string, descripcion: string, categoria_id: number, tipo: string, usuario_id: number) {
    await this.isReady;
    const sql = `INSERT INTO movimientos (monto, fecha, descripcion, categoria_id, tipo, usuario_id) VALUES (?, ?, ?, ?, ?, ?)`;
    try {
      const result = await this.db.run(sql, [monto, fecha, descripcion, categoria_id, tipo, usuario_id]);
      return (result?.changes?.changes ?? 0) > 0;
    } catch (error) {
      console.error('Error detallado en addMovimiento:', error);
      return false;
    }
  }

  async getCategoriasPorTipo(tipo: string) {
    await this.isReady;
    try {
      const res = await this.db.query('SELECT * FROM categorias WHERE tipo = ?', [tipo]);
      return res.values || [];
    } catch (e) {
      console.error('Error cargando categorías', e);
      return [];
    }
  }

  async getGastosPorCategoria(usuario_id: number) {
    await this.isReady;
    // Consultamos el total agrupado por el nombre de la categoría
    const sql = `
    SELECT c.nombre as categoria, SUM(m.monto) as total
    FROM movimientos m
    INNER JOIN categorias c ON m.categoria_id = c.id
    WHERE m.usuario_id = ? AND m.tipo = 'GASTO'
    GROUP BY c.nombre
    ORDER BY total DESC`;

    try {
      const res = await this.db.query(sql, [usuario_id]);
      return res.values || [];
    } catch (error) {
      console.error('Error al obtener gastos por categoría:', error);
      return [];
    }
  }

  async getReporteMensual(usuario_id: number, mes: number, anio: number) {
    await this.isReady;
    const sql = `
    SELECT m.*, c.nombre as categoria_nombre 
    FROM movimientos m
    LEFT JOIN categorias c ON m.categoria_id = c.id
    WHERE m.usuario_id = ? 
    AND strftime('%m', m.fecha) = ? 
    AND strftime('%Y', m.fecha) = ?
    ORDER BY m.fecha DESC`;

    const mesFormateado = mes < 10 ? `0${mes}` : `${mes}`;

    try {
      const res = await this.db.query(sql, [usuario_id, mesFormateado, anio.toString()]);
      return res.values || [];
    } catch (error) {
      console.error('Error en reporte mensual:', error);
      return [];
    }
  }

  async eliminarMovimiento(id: number) {
    await this.isReady;
    const sql = `DELETE FROM movimientos WHERE id = ?`;
    try {
      await this.db.run(sql, [id]);
      return true;
    } catch (error) {
      console.error('Error al eliminar movimiento:', error);
      return false;
    }
  }

  private async createTables() {
    const sql = `
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        correo TEXT NOT NULL UNIQUE,
        contrasenia TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS movimientos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        monto REAL NOT NULL,
        fecha TEXT NOT NULL,
        descripcion TEXT,
        categoria_id INTEGER,
        tipo TEXT NOT NULL,
        usuario_id INTEGER, -- 👈 Nueva columna
        FOREIGN KEY(categoria_id) REFERENCES categorias(id),
        FOREIGN KEY(usuario_id) REFERENCES usuarios(id) -- 👈 Relación
      );
      CREATE TABLE IF NOT EXISTS categorias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL UNIQUE,
        tipo TEXT NOT NULL CHECK (tipo IN ('INGRESO', 'GASTO'))
      );
      -- CATEGORÍAS DE INGRESO (20)
      INSERT OR IGNORE INTO categorias(nombre, tipo) VALUES 
      ('Sueldo', 'INGRESO'),
      ('Salario', 'INGRESO'),
      ('Honorarios', 'INGRESO'),
      ('Comisiones', 'INGRESO'),
      ('Ventas', 'INGRESO'),
      ('Alquileres', 'INGRESO'),
      ('Intereses Bancarios', 'INGRESO'),
      ('Dividendos', 'INGRESO'),
      ('Inversiones', 'INGRESO'),
      ('Freelance', 'INGRESO'),
      ('Bonificaciones', 'INGRESO'),
      ('Aguinaldo', 'INGRESO'),
      ('Premios', 'INGRESO'),
      ('Reembolsos', 'INGRESO'),
      ('Herencia', 'INGRESO'),
      ('Regalos', 'INGRESO'),
      ('Venta de Activos', 'INGRESO'),
      ('Subsidios', 'INGRESO'),
      ('Pensión', 'INGRESO'),
      ('Becas', 'INGRESO');
      INSERT OR IGNORE INTO categorias (nombre, tipo) VALUES 
      ('Alquiler/Hipoteca', 'GASTO'),
      ('Servicios (Luz, Agua, Gas)', 'GASTO'),
      ('Supermercado', 'GASTO'),
      ('Transporte', 'GASTO'),
      ('Gasolina/Combustible', 'GASTO'),
      ('Seguros', 'GASTO'),
      ('Salud/Medicina', 'GASTO'),
      ('Educación', 'GASTO'),
      ('Internet', 'GASTO'),
      ('Teléfono/Celular', 'GASTO'),
      ('Entretenimiento', 'GASTO'),
      ('Restaurantes', 'GASTO'),
      ('Ropa/Calzado', 'GASTO'),
      ('Mantenimiento Hogar', 'GASTO'),
      ('Impuestos', 'GASTO'),
      ('Deudas', 'GASTO'),
      ('Gimnasio/Deporte', 'GASTO'),
      ('Viajes/Vacaciones', 'GASTO'),
      ('Regalos/Donaciones', 'GASTO'),
      ('Gastos Personales', 'GASTO');
    `;
    await this.db.execute(sql);
  }
}