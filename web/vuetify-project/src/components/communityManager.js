export async function getProductes() {
    const response = await fetch('http://localhost:3001/getProducts');
    const productes = await response.json();
    return productes;
}

export async function updateProduct(updatedProduct) {
    try {
        // Añade el código para manejar la imagen
        const formData = new FormData();
        formData.append('name', updatedProduct.name);
        formData.append('price', updatedProduct.price);
        formData.append('description', updatedProduct.description);
        formData.append('stock', updatedProduct.stock);
        formData.append('image', updatedProduct.image[0])
        const response = await fetch(`http://localhost:3001/putProductes/${updatedProduct.id}`, {
            method: 'PUT',
            body: formData,
        });
    } catch (error) {
        console.error('Error al actualizar el producto:', error);
        // Manejar el error según sea necesario
        throw error; // Puedes propagar el error para manejarlo en el componente que llama a esta función
    }
}

export async function deleteProduct(productId, nameProduct) {
    const response = await fetch(`http://localhost:3001/delete/${productId}/${nameProduct}`, {
        method: 'DELETE',
    });
}

export async function addProduct(newProduct) {
    try {
        // Añade el código para manejar la imagen
        const formData = new FormData();
        formData.append('name', newProduct.name);
        formData.append('price', newProduct.price);
        formData.append('description', newProduct.description);
        formData.append('stock', newProduct.stock);
        formData.append('image', newProduct.image[0])
        await fetch('http://localhost:3001/postProductes', {
            method: 'POST',
            body: formData,
        });
    } catch (error) {
        console.error('Error al actualizar el producto:', error);
        // Manejar el error según sea necesario
        throw error; // Puedes propagar el error para manejarlo en el componente que llama a esta función
    }
}

export async function getOrders(status_id) {
    const response = await fetch(`http://localhost:3001/getOrders/${status_id}`);
    const orders = await response.json();
    return orders;
}

export async function getUsers() {
    const response = await fetch('http://localhost:3001/getUsers');
    const users = await response.json();
    console.log(users);
    return users;
}
export async function deleteOrder(OrderId) {
    await fetch(`http://localhost:3001/deleteOrder/${OrderId}`, {
        method: 'DELETE',
    });
}
export async function getPython() {
    const response = await fetch('http://localhost:3001/python',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', }
        })
    const responseData = await response.json();
    const { productImage, ordersImage } = responseData;

    return { productImage, ordersImage };

}

