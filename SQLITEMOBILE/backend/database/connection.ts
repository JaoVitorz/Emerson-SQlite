// Mantém uma única conexão aberta com o banco MeusLivros.db do aplicativo.
import * as SQLite from 'expo-sqlite';
import { inicializarBanco } from './initialize.ts';

// Uma conexão por execução. O arquivo permanece no armazenamento do aplicativo.
let connection: Promise<SQLite.SQLiteDatabase> | undefined;
export function Banco() {
  if (!connection) {
    connection = (async () => {
      const db = await SQLite.openDatabaseAsync('MeusLivros.db');
      await inicializarBanco(db);
      return db;
    })().catch((error) => {
      connection = undefined;
      throw error;
    });
  }
  return connection;
}
