//Constantes requeridas de las dependencias
const mysql = require('mysql2');
const express = require('express');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const app = express();
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require("cors");
const { verify } = require('crypto'); //???
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(
    session({
        secret: "mi_secreto", //Medida de seguridad para asegurarse de que la información en la cookie no sea manipulada por el cliente
        resave: false, // Indica que la sesión no se volverá a guardar en el almacén en cada solicitud
        saveUninitialized: true, //Indica que la sesión se guardará en el almacén incluso si no ha sido modificada durante la solicitud
    })
);
app.use(fileUpload());
app.use('/images', express.static(path.join(__dirname, 'images')));
//Datos para la conexion a la base de datos
const pool = mysql.createPool({
    connectionLimit: 10, // ajusta según tus necesidades
    host: "dam.inspedralbes.cat",
    user: "a22martiptai_pro",
    password: "Samuel1507@",
    database: "a22martiptai_pro1"
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
function GetUsuarios() {
    return new Promise(async (resolve, reject) => {
        const connection = await GetConnection();
        var sql = "SELECT * FROM users;";
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
function InsertProducts(name, description, price, stock) {
    return new Promise(async (resolve, reject) => {
        const connection = await GetConnection();
        var sql = "INSERT INTO products (name, description, price, stock) VALUES (?, ?, ?, ?);";
        var values = [name, description, price, stock];

        connection.execute(sql, values, function (err, result) {
            if (err) {
                reject(err);
            } else {
                connection.release();
                resolve(result.insertId); // Devolver el ID del producto insertado
            }
        });
    });
}
//Realizamos updates de los productes con su id
function UpdateProducts(id, name, description, price, stock) {
    return new Promise(async (resolve, reject) => {
        const connection = await GetConnection();
        var sql = "UPDATE products SET name = '" + name + "', description = '" + description + "', price = " + price + ", stock = " + stock + " WHERE id = " + id + ";";
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
function GetProducts() {
    return new Promise(async (resolve, reject) => {
        const connection = await GetConnection();
        var sql = "SELECT * FROM products;";
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
//Consultamos los pedidos de cada usuario con su id 
function GetStatus(id) {
    return new Promise(async (resolve, reject) => {
        const connection = await GetConnection();
        var sql = "SELECT * FROM orders WHERE user_id = " + id + ";";
        connection.execute(sql, function (err, result) {
            if (err) {
                console.log(err);
            }
            else {
                connection.release();
                resolve(result);
            }
        });
    })
}
//Consultamos todos los pedidos
function GetAllOrders() {
    return new Promise(async (resolve, reject) => {
        const connection = await GetConnection();
        var sql = "SELECT O.id_order, O.order_status, GROUP_CONCAT(P.name) AS products, SUM(P.price) AS total_price FROM (SELECT DISTINCT id AS id_order, order_status AS order_status FROM orders) AS O LEFT JOIN contains AS CO ON O.id_order = CO.id_orders LEFT JOIN products AS P ON CO.id_products = P.id GROUP BY O.id_order, O.order_status;";
        connection.execute(sql, function (err, result) {
            if (err) {
                console.log(err);
            }
            else {
                connection.release();
                resolve(result);
            }
        });
    })
}
//Funcion que elimina un pedido una vez lo rechazamos
function DeclineOrder(id) {
    return new Promise(async (resolve, reject) => {
        const connection = await GetConnection();
        var sql = "DELETE FROM orders WHERE id = " + id + ";";
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
//Para eliminar un pedido primero debemos eliminar donde hace referencia como foreing key
function DeleteContains(idOrder){
    return new Promise(async (resolve, reject) => {
        const connection = await GetConnection();
        var sql = "DELETE FROM contains WHERE id_orders = " + idOrder + ";";
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
//Eliminamos un producto
function DeleteProduct(id) {
    return new Promise(async (resolve, reject) => {
        const connection = await GetConnection();
        var sql = "DELETE FROM products WHERE id = " + id + ";";
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
// funcion para añadir imagenes
function addImage(imageFile, name, idSelected) {
    // Obtener la extensión original del archivo
    const originalExtension = path.extname(imageFile.name);

    // Construir el nuevo nombre del archivo
    const newFileName = `${name.replace(/\s/g, '-')}${idSelected}${originalExtension}`;
    const uploadPath = path.join(__dirname, 'images', newFileName);

    // Comprobar si el archivo ya existe
    if (fs.existsSync(uploadPath)) {
        // Si existe, eliminar el archivo existente antes de reemplazarlo
        fs.unlinkSync(uploadPath);
    }

    imageFile.mv(uploadPath, function (err) { // funcion de introducir la imagen
        if (err) {
            return res.status(500).send(err);
        }
    });
}
//Funcion que elimina una imagen de la carpeta
function deleteImage(idSelected, name) {

    // Construir el nombre del archivo a eliminar
    const fileNameToDelete = `${name.replace(/\s/g, '-')}${idSelected}.jpg`;

    // Construir la ruta completa del archivo
    const filePath = path.join(__dirname, 'images', fileNameToDelete);

    // Comprobar si el archivo existe antes de intentar eliminarlo
    if (fs.existsSync(filePath)) {
        // Eliminar el archivo
        fs.unlinkSync(filePath);
        console.log(`Archivo ${fileNameToDelete} eliminado correctamente.`);
    } else {
        console.log(`El archivo ${fileNameToDelete} no existe.`);
    }
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

//Verificamos que los usuarios que recibimos existan en la base de datos
async function VerifyUsers(username, password) {
    try {
        const data = await GetUsuarios();
        const usuarios = data || []; // [] garantiza que usuarios sea un array, incluso si data es undefined
        const user = usuarios.find((u) => u.username === username && u.password === password);
        return Boolean(user); // Devolvemos un true si se han encontrado
    } catch (err) {
        console.log(err.message);
        return false; // Devolvemos un false si no existen en la base de datos
    }
}
//Obtenemos el 'id' del usuario pasando como parametro su 'username'
async function GetIdUser(username) {
    try {
        const data = await GetUsuarios();
        const users = data || [];
        const user = users.find(u => u.username === username);
        if (user) {
            return user.id; //Devolvemos el id del usuario
        } else {
            return 0; //Devolvemos '0' en caso de que no encuentre el usuario
        }
    } catch (err) {
        console.log(err.message);
        return 0;
    }
}
//Conexcion con el servidor
app.listen(PORT, () => {
    console.log("Server  =>" + PORT);
});
//Devolvemos los usuarios registrados
app.get("/getUsers", (req, res) => {
    GetUsuarios()
        .then((data) => {
            const users = data;
            res.json(users);
        })
        .catch((err) => {
            console.log(err);
        });
});
//Verificamos que el usuario este en la base de datos y devolvemos un booleano en formato Json
app.post("/verify", async (req, res) => {
    const { username, password } = req.body;

    if (await VerifyUsers(username, password)) {
        req.session.loggedIn = true;
        req.session.userId = await GetIdUser(username);
        res.status(200).send({ mensaje: 'Operación exitosa' });
    }
});
//Obtnemos los pedidos de cada usuario
app.get("/getStatus", (req, res) => {
    const id = req.session.userId;
    console.log(req.session.userId);
    GetStatus(id)
        .then((data) => {
            const status = data;
            res.json(status);
        })
        .catch((err) => {
            console.log(err);
        });
})
//Recogemos los productos de nuestra base de datos
app.get("/getProducts", (req, res) => {
    GetProducts()
        .then(async (data) => {
            const products = data;

            // Mapear los productos para agregar las URLs de las imágenes
            const productsWithImages = await Promise.all(products.map(async (product) => {
                // Construir el nombre de la imagen
                const imageName = `${product.name.replace(/\s+/g, '-')}${product.id}`;

                const imageUrl = `http://localhost:3001/images/${imageName}.jpg`;

                return {
                    ...product,
                    imageUrl,
                };
            }));

            res.json(productsWithImages);
        })
        .catch((err) => {
            console.log(err);
        })
});
//Devolvemos todos los pedidos
app.get("/getOrders", (req, res) => {
    GetAllOrders()
        .then((data) => {
            const orders = data;
            res.json(orders)
        })
        .catch((err) => {
            console.log(err);
        })
})
//Eliminamos un pedido
app.delete("/deleteOrder/:id", async (req, res) => {
    try {
        const idOrder = parseInt(req.params.id);
        await DeleteContains(idOrder);
        await DeclineOrder(idOrder);
        res.status(200).json({ message: 'Pedido eliminado correctamente.' });

    } catch (error) {
        console.error('Error al eliminar el pedido', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});
//Añadimos un producto nuevo a la base de datos
app.post("/postProductes", async (req, res) => {
    const productObject = req.body;
    console.log(productObject);
    const name = productObject.name;
    const description = productObject.description;
    const price = productObject.price;
    const stock = productObject.stock;
    const imageFile = req.files.image;

    // Insertar un nuevo producto
    const productId = await InsertProducts(name, description, price, stock);
    addImage(imageFile, name, productId);
    // Enviar la respuesta con el producto y el número total de productos
    res.json({ product: productObject });
});
//Eliminamos un producto seleccionando su id
app.delete("/delete/:id/:name", async (req, res) => {
    try {
        const idSelected = parseInt(req.params.id);
        const nameProduct = req.params.name;
        // Verificamos si existe un archivo adjunto en la solicitud DELETE

        deleteImage(idSelected, nameProduct);

        await DeleteProduct(idSelected);
        res.status(200).json({ message: 'Producto eliminado correctamente.' });
    } catch (error) {
        console.error('Error al eliminar el producto:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});
//Modificamos un producto seleccionando su id
app.put("/putProductes/:id", async (req, res) => {
    try {
        const idSelected = parseInt(req.params.id);
        const productObject = req.body;

        const name = productObject.name;
        const description = productObject.description;
        const price = productObject.price;
        const stock = productObject.stock;
        const imageFile = req.files.image; // "image" es el nombre del campo en el formulario

        addImage(imageFile, name, idSelected) // funcion de agregar imagen

        await UpdateProducts(idSelected, name, description, price, stock);
        res.json(productObject);
    } catch (error) {
        console.error('Error al actualizar el producto:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});




