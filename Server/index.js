//Constantes requeridas de las dependencias
const mysql = require('mysql2');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
var cors = require("cors");
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
//Datos para la conexion a la base de datos de Pol
const pool = mysql.createPool({
    connectionLimit: 10, // ajusta según tus necesidades
    host: "dam.inspedralbes.cat",
    user: "a22polazasot_users",
    password: "Contrasenya2004",
    database: "a22polazasot_baseTienda"
});
//Conexion con la base de datos
function GetConnection() {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                reject(err);
            } else {
                resolve(connection);
            }
        });
    });
}
//Usuarios
function Usuarios() {
    return new Promise(async(resolve, reject) => {
        const connection = await GetConnection();
        var sql = "SELECT nom_usuari, contrasenya FROM usuaris;";
        connection.execute(sql, function (err, result) {
            
            if (err) {
                reject(err);
            }
            else {
                connection.release();
                resolve(result);
            }

        });
    });
}
//Realizamos inserts de los productos
function Insert(nombre, precio, descripcion, disponibilidad, tipo_id, tienda_id, fotos) {
    return new Promise(async(resolve, reject) => {
        const connection = await GetConnection();
        var sql = "INSERT INTO productes (nombre, precio, descripcion, disponibilidad, tipo_id, tienda_id, fotos) VALUES (?, ?, ?, ?, ?, ?, ?)"
        connection.execute(sql, [nombre, precio, descripcion, disponibilidad, tipo_id, tienda_id, fotos], function (err, result) {
            if (err) {
                reject(err);
            }
            else {
                connection.release();
                resolve(result);
                console.log("1 record inserted");
            }
        });
    });
}
//Realizamos updates de los productes con su id
function Update(id, nombre, precio, descripcion, disponibilidad, tipo_id, tienda_id, fotos) {
    return new Promise(async(resolve, reject) => {
        const connection = await GetConnection();
        var sql = "UPDATE productes SET nombre = '"+nombre+"', precio = "+precio+", descripcion = '"+descripcion+"', disponibilidad = "+disponibilidad+", tipo_id = "+tipo_id+", tienda_id = "+tienda_id+", fotos = '"+fotos+"' WHERE id = "+id+";";
        connection.execute(sql, function (err, result) {
            if (err) {
                reject(err);
            }
            else {
                connection.release()
                resolve(result);
                console.log("1 record update");
            }
        });
    });
}
//Consulta para recoger todos los datos
function Queries() {
    return new Promise(async(resolve, reject) => {
        const connection = await GetConnection();
        var sql = "SELECT * FROM productes;";
        connection.execute(sql, function (err, result) {
            
            if (err) {
                reject(err);
            }
            else {
                connection.release();
                resolve(result);
            }

        });
    });

}
function DeleteProduct(id) {
    return new Promise(async(resolve, reject) => {
        const connection = await GetConnection();
        var sql = "DELETE FROM productes WHERE id = "+id+";";
        connection.execute(sql, function (err, result) {
            if (err) {
                reject(err);
            }
            else {
                connection.release();//libera la conexión después de obtener los resultados
                resolve(result);
            }

        });
    });
}
// Cerramos el pool de conexiones cuando la aplicación se detenga
process.on('SIGINT', () => {
    pool.end((err) => {
        if (err) {
            console.error("Error al cerrar el pool de conexiones:", err.message);
        } else {
            console.log("Se cerró el pool de conexiones.");
        }
        process.exit();
    });
});
//Conexcion con el servidor
app.listen(PORT, () => {
    console.log("Server  =>" + PORT);
});
app.get("/usuarios",(req, res) =>{
    Usuarios()
    .then((data) => {
        const usuarios = data;
        res.json(usuarios);
    })
    .catch((err) => {
        console.log(err);
    })

});
//Recogemos los productos de nuestra base de datos
app.get("/getProductes", (req, res) => {
    Queries()
        .then((data) => {
            const productes = data;
            res.json(productes);
        })
        .catch((err) => {
            console.log(err);
        })
});
//Añadimos un producto nuevo a la base de datos
app.post("/postProductes", (req, res) => {
    const productObject = req.body;
    console.log(productObject);
    const nombre = productObject.nombre;
    const precio = productObject.precio;
    const descripcion = productObject.descripcion;
    const disponibilidad = productObject.disponibilidad;
    const tipo_id = productObject.tipo_id;
    const tienda_id = productObject.tienda_id;
    const fotos = productObject.fotos;
    Insert(nombre, precio, descripcion, disponibilidad, tipo_id, tienda_id, fotos);
    res.json(productObject);
});
//Eliminamos un producto seleccionando su id
app.delete("/delete/:id",(req ,res) =>{
    console.log("Entre");
    const idSelected = parseInt(req.params.id);
    console.log(idSelected);
    DeleteProduct(idSelected);
});
//Modificamos un producto con seleccionando su id
app.put("/putProductes/:id",(req, res) => {
    const idSelected = parseInt(req.params.id);
    const productObject = req.body;
    console.log(productObject);
    const nombre = productObject.nombre;
    const precio = productObject.precio;
    const descripcion = productObject.descripcion;
    const disponibilidad = productObject.disponibilidad;
    const tipo_id = productObject.tienda_id;
    const tienda_id = productObject.tienda_id;
    const fotos = productObject.fotos;
    Update(idSelected, nombre, precio, descripcion, disponibilidad, tipo_id, tienda_id, fotos)
    res.json(productObject);
});




