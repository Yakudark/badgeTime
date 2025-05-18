import * as SQLite from 'expo-sqlite';

let db = null;

export const initDB = async () => {
    try {
        db = await SQLite.openDatabaseAsync('hours.db');

        await new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    `CREATE TABLE IF NOT EXISTS working_hours (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        date TEXT UNIQUE,
                        start_time TEXT,
                        pause_start TEXT,
                        pause_end TEXT,
                        end_time TEXT
                    );`,
                    [],
                    resolve,
                    (_, error) => reject(error)
                );
            });
        });

        console.log('Database initialized');
        return db;
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
};

export const getDatabase = () => {
    if (!db) {
        throw new Error('Database not initialized. Call initDB first.');
    }
    return db;
};

// ...autres fonctions à implémenter plus tard...
