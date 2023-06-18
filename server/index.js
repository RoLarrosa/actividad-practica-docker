require('dotenv/config.js');

const express = require('express');
const mariadb = require('mariadb');
const cors = require('cors')

const app = express();
const port = 3000;

app.use(cors())
app.use(express.json())

// Configuración de la conexión a la base de datos

const pool = mariadb.createPool({
	host: process.env.DATABASE_HOST || 'localhost',
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || 'root',
    database: process.env.DATABASE_NAME || 'test',
});

// Establecer una conexión al iniciar el servidor
pool.getConnection()
	.then(connection => {
		console.log('Conexión a la base de datos establecida');
		connection.release();
	})
	.catch(error => {
		console.error('Error al conectar a la base de datos:', error);
	});

async function createTable () {
	const sql = `
		CREATE TABLE IF NOT EXISTS productos (
			id INT NOT NULL AUTO_INCREMENT,
			nombre VARCHAR(100) NOT NULL,
			precio FLOAT NOT NULL,
			PRIMARY KEY (id)
		)
	`

	return await pool.query(sql)
}


// Rutas CRUD
app.get('/productos',async (req, res) => {
	let conn;
	
	try {
		conn = await pool.getConnection();
		await createTable()
		const rows = await conn.query('SELECT * FROM mi_base_de_datos.productos');
		res.json(rows);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error al obtener los productos' });
	} finally {
		if (conn) conn.release();
	}
});

app.post('/productos', async(req, res) => {
		const { nombre, precio } = req.body;

		if (!nombre || !precio) {
			res.status(400).json({ error: 'El nombre y el precio son obligatorios' });
			return;
		}
	
		let conn;
		try {
			conn = await pool.getConnection();
			await conn.query('INSERT INTO mi_base_de_datos.productos (nombre, precio) VALUES (?, ?)', [nombre, precio]);
			res.status(201).json({ message: 'Producto creado exitosamente' });
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: 'Error al crear el producto' });
		} finally {
			if (conn) conn.release();
		}
	});

// Ruta PUT: 
app.put('/productos/:id', async(req, res) => {
	const { id } = req.params;
	const { nombre, precio } = req.body;
	
	if (!nombre || !precio) {
	  res.status(400).json({ error: 'El nombre y el precio son obligatorios' });
	  return;
	}
  
	let conn;
	try {
	  conn = await pool.getConnection();
	  await conn.query('UPDATE mi_base_de_datos.productos SET nombre = ?, precio = ? WHERE id = ?', [nombre, precio, id]);
	  res.json({ message: `Producto con ID ${id} actualizado exitosamente` });

	} catch (error) {
	  console.error(error);
	  res.status(500).json({ error: 'Error al actualizar el producto' });

	} finally {
	  if (conn) conn.release();
	}
});
  
  // Ruta DELETE:
app.delete('/productos/:id', async (req, res) => {
	const { id } = req.params;

	let conn;
	try {
		conn = await pool.getConnection();
		await conn.query('DELETE FROM mi_base_de_datos.productos WHERE id = ?', [id]);
		res.json({ message: `Producto con ID ${id} eliminado exitosamente` });

	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error al eliminar el producto' });

	} finally {
		if (conn) conn.release();
	}
});

// Iniciar el servidor
app.listen(port, () => {
	console.log(`Servidor iniciado en el puerto ${port}`);
});
