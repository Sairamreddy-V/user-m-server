const express = require('express');
const app = express();
app.use(express.json());
const cors = require('cors');
app.use(cors());

const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');
const pathOfFile = path.join(__dirname, '/userDatabase/database.db');

let db;

const initializingDbandServerConnection = async () => {
    try {
        db = await open({
            filename: pathOfFile,
            driver: sqlite3.Database,
        });
        app.listen(3000, () => {
            console.log(`Server running at port 3000...`);
        });
    } catch (error) {
        console.error('Error initializing database and server:', error);
    }
};

initializingDbandServerConnection();

// API for getting all the users in the user table
app.get('/users', async (request, response) => {
    try {
        const search = request.query.search || "";
        const page = parseInt(request.query.page, 10) || 1;
        const limit = 20;
        const offset = (page - 1) * limit;
        const query = `
            SELECT 
                *
            FROM 
                user_table
            WHERE
                name LIKE ?
            LIMIT ${limit}
            OFFSET ${offset}
        `;
        const result = await db.all(query, [`%${search}%`]);
        response.status(200).json({ result });
    } catch (error) {
        response.status(500).json({ error: 'Internal server error' });
    }
});

// API to insert a user into the users table
app.post('/user', async (request, response) => {
    try {
        const { name, dateOfBirth, contactNumber, emailId, userDescription } = request.body;
        const query = `
            INSERT INTO 
                user_table (name, date_of_birth, contact_number, email_id, user_description)
            VALUES
                (?, ?, ?, ?, ?)
        `;
        await db.run(query, [name, dateOfBirth, contactNumber, emailId, userDescription]);
        response.status(200).json({ message: `${name} created successfully` });
    } catch (error) {
        response.status(500).json({ error: 'Internal server error' });
    }
});

// API for getting a user by ID
app.get('/user/:id', async (request, response) => {
    try {
        const { id } = request.params;
        const query = `
            SELECT 
                *
            FROM 
                user_table
            WHERE 
                id = ?
        `;
        const result = await db.get(query, [id]);
        response.status(200).json({ result });
    } catch (error) {
        response.status(500).json({ error: 'Internal server error' });
    }
});

// API to edit the user
app.put('/edit-user/:id', async (request, response) => {
    try {
        const { id } = request.params;
        const { name, dateOfBirth, contactNumber, emailId, userDescription } = request.body;
        const query = `
            UPDATE user_table
            SET
                name = ?, date_of_birth = ?, contact_number = ?, email_id = ?, user_description = ?
            WHERE 
                id = ?
        `;
        await db.run(query, [name, dateOfBirth, contactNumber, emailId, userDescription, id]);
        response.status(200).json({ message: `User ${name} updated successfully` });
    } catch (error) {
        response.status(500).json({ error: 'Internal server error' });
    }
});

// API to delete user
app.delete('/delete-user/:id', async (request, response) => {
    try {
        const { id } = request.params;
        const query = `
            DELETE FROM 
                user_table
            WHERE 
                id = ?
        `;
        await db.run(query, [id]);
        response.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        response.status(500).json({ error: 'Internal server error' });
    }
});
