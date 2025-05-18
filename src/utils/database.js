import * as SQLite from 'expo-sqlite';

let db = null;

export const initDB = async () => {
    try {
        if (!db) {
            db = await SQLite.openDatabaseAsync('hours.db');
            await db.execAsync(`
                CREATE TABLE IF NOT EXISTS working_hours (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date TEXT UNIQUE,
                    start_time TEXT,
                    pause_start TEXT,
                    pause_end TEXT,
                    end_time TEXT
                );
            `);
        }
        return db;
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
};

export const getEntryByDate = async (date) => {
    try {
        const db = await initDB();
        const result = await db.getAllAsync(
            'SELECT * FROM working_hours WHERE date = ?;',
            [date]
        );
        return result.length > 0 ? result[0] : null;
    } catch (error) {
        console.error('Error getting entry:', error);
        throw error;
    }
};

export const saveEntry = async (date, times) => {
    try {
        const db = await initDB();
        const existing = await getEntryByDate(date);

        const query = existing
            ? 'UPDATE working_hours SET start_time = ?, pause_start = ?, pause_end = ?, end_time = ? WHERE date = ?'
            : 'INSERT INTO working_hours (start_time, pause_start, pause_end, end_time, date) VALUES (?, ?, ?, ?, ?)';

        const params = [
            times.start_time?.format('HH:mm') || null,
            times.pause_start?.format('HH:mm') || null,
            times.pause_end?.format('HH:mm') || null,
            times.end_time?.format('HH:mm') || null,
            date
        ];

        await db.runAsync(query, params);
    } catch (error) {
        console.error('Error saving entry:', error);
        throw error;
    }
};

export const deleteEntry = async (date) => {
    try {
        const db = await initDB();
        await db.runAsync('DELETE FROM working_hours WHERE date = ?;', [date]);
    } catch (error) {
        console.error('Error deleting entry:', error);
        throw error;
    }
};

export const resetDB = async () => {
    try {
        const db = await initDB();
        await db.runAsync('DELETE FROM working_hours;');
    } catch (error) {
        console.error('Error resetting database:', error);
        throw error;
    }
};

export const getMonthEntries = async (yearMonth) => {
    try {
        const db = await initDB();
        const result = await db.getAllAsync(
            "SELECT * FROM working_hours WHERE date LIKE ? || '%' ORDER BY date ASC;",
            [yearMonth]
        );
        return result;
    } catch (error) {
        console.error('Error getting month entries:', error);
        throw error;
    }
};

export const getMonthlyTotal = async (yearMonth) => {
    try {
        const db = await initDB();
        const entries = await db.getAllAsync(
            "SELECT * FROM working_hours WHERE date LIKE ? || '%' ORDER BY date ASC;",
            [yearMonth]
        );
        return entries;
    } catch (error) {
        console.error('Error getting monthly total:', error);
        throw error;
    }
};
