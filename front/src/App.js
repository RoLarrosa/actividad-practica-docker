import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {

  const [productos, setProductos] = useState([]);
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [editarId, setEditarId]= useState(0);

  useEffect(() => {
    obtenerProductos();
  }, []);

  const obtenerProductos = () => {
    fetch('http://localhost:3000/productos')
      .then(response => response.json())
      .then(data => setProductos(data))
      .catch(error => console.error(error));
  };

  const agregarProducto = () => {
    const nuevoProducto = {
      nombre: nombre,
      precio: parseFloat(precio)
    };

    fetch('http://localhost:3000/productos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(nuevoProducto)
    })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        obtenerProductos(); 
        setNombre('');
        setPrecio('');
      })
      .catch(error => console.error(error));
  };

  const setearProductoEditar = id => {
    setEditarId(id);
  }

  const actualizarProducto = id => {
    const productoActualizado = {
      nombre: nombre,
      precio: parseFloat(precio)
    };

    setEditarId(0);

    fetch(`http://localhost:3000/productos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productoActualizado)
    })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        obtenerProductos(); // Actualizar la lista de productos después de actualizar uno
        setNombre('');
        setPrecio('');
      })
      .catch(error => console.error(error));
  };

  const eliminarProducto = id => {
    fetch(`http://localhost:3000/productos/${id}`, {
      method: 'DELETE'
    })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        obtenerProductos(); // Actualizar la lista de productos después de eliminar uno
      })
      .catch(error => console.error(error));
  };

  return (
    <div>
      <h1>Lista de Productos</h1>
      <ul>
        {productos.map(producto => (
          <li key={producto.id}>
            {producto.nombre} - ${producto.precio}
            <button onClick={() => eliminarProducto(producto.id)}>Eliminar</button>
            <button onClick={() => setearProductoEditar(producto.id)}>Editar</button>
          </li>
        ))}
      </ul>
      <h2>Agregar Producto</h2>
      <input type="text" placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} />
      <input type="number" placeholder="Precio" value={precio} onChange={e => setPrecio(e.target.value)} />
      <button onClick={agregarProducto}>Agregar</button>
      
      {
        editarId > 0 ? (
          <div>
            <h2>Actualizar Producto</h2>
            <input type="text" placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} />
            <input type="number" placeholder="Precio" value={precio} onChange={e => setPrecio(e.target.value)} />
            <button onClick={() => actualizarProducto(editarId)}>Actualizar</button>
          </div>
        ) : null
      }

      
    </div>
  );
}

export default App;
