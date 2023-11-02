<script setup>
import { getProductes, updateProduct, deleteProduct, addProduct, getOrders} from './communityManager';
import Orders from './Orders.vue';
import Preparation from './OrderPreparation.vue';
import Summary from './SummaryOrders.vue';

</script>
<script>
export default {
    components: {
        Orders,
        Preparation,
        Summary
    },
    data() {
        return {
            products: [],
            orders: [],
            users: [],
            modalEditor: false,
            modalAddProduct: false,
            details: false,
            idProduct: null,
            currentPage: "page1",
            newProduct: {
                name: '',
                description: '',
                price: 0,
                stock: 0,
                image: null,
            },
            modifiedProduct: { // variable para guardar datos del producto que vamos a editar
                id: 0,
                name: '',
                image: '',
                price: 0,
                stock: 0,
            },

        }
    },
    async created() {
        this.products = await getProductes();
        console.log(this.products)
    },
    methods: {
        openAddProductModal() {
            this.modalAddProduct = true;
        },
        openModalEditor(product) {
            this.modifiedProduct = { ...product }; // asignar valores del producto seleccionado para modificar
            this.modalEditor = true;
        },
        async modifyProduct() {
            const timestamp = new Date().getTime(); // crear marca de tiempo
            const responseUpdate = await updateProduct(this.modifiedProduct)
            this.modalEditor = false;
            const updatedProductIndex = this.products.findIndex(p => p.id === this.modifiedProduct.id);
            this.modifiedProduct.imageUrl = `${this.modifiedProduct.imageUrl}?timestamp=${timestamp}`; // crea una nueva URL de imagen con un parámetro de marca de tiempo único
            // El parámetro de marca de tiempo (timestamp) que se agrega a la URL de la imagen en el frontend es específico para la detección de cambios en el frontend.

            // Encontrar el producto modificado en el array de products
            if (updatedProductIndex !== -1) {
                // Actualizar el producto modificado
                this.products[updatedProductIndex] = this.modifiedProduct
            }
        },
        async deleteProductSelected(productId, nameProduct) {
            // Lógica para eliminar el producto con el ID proporcionado
            // Puedes llamar a tu función de eliminación aquí y actualizar la lista de productos después
            await deleteProduct(productId, nameProduct);
            this.products = await getProductes(); // Actualiza la lista de productos después de eliminar
        },
        async addNewProduct() {
            // Lógica para agregar el nuevo producto, puedes utilizar la función que tienes para añadir productos
            // Puedes acceder a los datos del nuevo producto en this.newProduct
            console.log('Nuevo Producto:', this.newProduct);

            // Cierra el modal después de agregar el producto
            this.modalAddProduct = false;
            const responseAdd = await addProduct(this.newProduct);
            this.products = await getProductes();
        },
        async showPage() {
                this.orders = await getOrders();
                console.log('Orders:', this.orders);
        },
        showDetails(product) {
            this.idProduct = product;
            this.details = !this.details;
        },
    }
}
</script>
<template>
    <v-layout class="main container">
        <v-app-bar>
            <v-app-bar-title>T A K E A W A Y</v-app-bar-title>
            <v-btn @click="this.currentPage = 'page1';">Productes</v-btn>
            <v-btn @click="this.currentPage = 'page2'; showPage()">Recepcio de comandes</v-btn>
            <v-btn @click="this.currentPage = 'page3';">Preparacio de comandes</v-btn>
            <v-btn @click="this.currentPage = 'page4'">Resum de comandes</v-btn>
        </v-app-bar>
        <!-- P  A  G  E    P  R  O  D  U  C  T  S -->
        <v-container v-if="currentPage === 'page1'">
            <v-main>
                <v-container>
                    <v-row>
                        <v-col v-for="product in products" :key="product.id" cols="12" md="4">
                            <v-card>
                                <v-sheet>
                                    <!-- Mostrar la imagen -->
                                    <v-img :src="product.imageUrl" alt="Product Image"
                                        style="max-width: 100%; height: 220px; object-fit: cover;"></v-img>
                                    <v-card-title>
                                        {{ product.name }}
                                    </v-card-title>
                                    <v-parallax style="margin-left: 15px;">{{ product.price }}€ </v-parallax>
                                </v-sheet>
                                <v-card-actions>
                                    <v-btn @click="openModalEditor(product)" color="primary">Editar</v-btn>
                                    <v-btn @click="deleteProductSelected(product.id, product.name)"
                                        color="error">Eliminar</v-btn>
                                    <v-btn @click="showDetails(product.id)" color="yellow">Info</v-btn>
                                </v-card-actions>
                                <v-expand-transition v-if="details && product.id == idProduct">
                                    <v-card>
                                        <v-parallax
                                            style="margin-right: 15px; margin-left: 15px; margin-bottom: 10px; font-weight: bold;">{{
                                                product.name }}</v-parallax>
                                        <v-parallax
                                            style="margin-right: 15px; margin-left: 15px; margin-bottom: 10px;">Precio: {{
                                                product.price }}€</v-parallax>
                                        <v-parallax style="margin-right: 15px; margin-left: 15px; margin-bottom: 10px;">{{
                                            product.description }}</v-parallax>
                                    </v-card>
                                </v-expand-transition>
                            </v-card>
                        </v-col>
                        <v-card
                            style="width: 360px; height: 323px; display: flex; align-items: center; justify-content: center; position: relative; top: 10px; margin-left: 12px;">
                            <v-sheet>
                                    <v-btn @click="openAddProductModal" icon
                                    style="font-size: 55px; width: 80px; height: 80px;">
                                    <v-icon>mdi-plus</v-icon>
                                </v-btn> 
                            </v-sheet>
                        </v-card>
                    </v-row>
                </v-container>
            </v-main>
        </v-container>
        <!-- modal editar productos -->
        <v-dialog v-model="modalEditor" max-width="600">
            <v-card>
                <v-card-title>Editar Producto</v-card-title>
                <v-card-text>
                    <v-form @submit.prevent="modifyProduct" enctype="multipart/form-data">
                        <v-text-field v-model="modifiedProduct.name" label="Nombre del Producto"></v-text-field>
                        <v-text-field v-model="modifiedProduct.price" label="Precio del Producto"></v-text-field>
                        <v-text-field v-model="modifiedProduct.description" label="Descripción del Producto"></v-text-field>
                        <v-text-field v-model="modifiedProduct.stock" label="Stock del Producto"></v-text-field>
                        <v-file-input v-model="modifiedProduct.image" name="image" label="Imagen del Producto" show-size
                            accept="image/*"></v-file-input>
                        <!--show size muestra el tamaño de imagen / accept="image/*" asegura que solo inserten imágenes-->
                        <v-btn type="submit" color="primary">Guardar Cambios</v-btn>
                    </v-form>
                </v-card-text>
            </v-card>
        </v-dialog>
        <v-dialog v-model="modalAddProduct" max-width="600">
            <v-card>
                <v-card-title>Añadir Nuevo Producto</v-card-title>
                <v-card-text>
                    <v-form @submit.prevent="addNewProduct" enctype="multipart/form-data">
                        <v-text-field v-model="newProduct.name" label="Nombre del Producto"></v-text-field>
                        <v-text-field v-model="newProduct.description" label="Descripción"></v-text-field>
                        <v-text-field v-model="newProduct.price" label="Precio"></v-text-field>
                        <v-text-field v-model="newProduct.stock" label="Stock"></v-text-field>
                        <v-file-input v-model="newProduct.image" name="image" label="Imagen del Producto" show-size
                            accept="image/*"></v-file-input>
                        <v-btn type="submit" color="primary">Añadir Producto</v-btn>
                    </v-form>
                </v-card-text>
            </v-card>
        </v-dialog>
        <!-- P  A  G  E    O  R  D  E  R  S -->
        <Orders v-if="currentPage === 'page2'" :orders="orders" :users="users" :products="products" :callGetOrders="showPage"></Orders>
        <!-- P  A  G  E    P  R  E   P  A  R  A  T  I  O  N -->
        <Preparation v-if="currentPage === 'page3'" :orders="orders" :users="users" :products="products"></Preparation>
        <!-- P  A  G  E    S  U  M  M  A  R  Y -->
        <Summary v-if="currentPage === 'page4'" :orders="orders" :users="users" :products="products" :callGetOrders="showPage"></Summary>
    </v-layout>
</template>
<style ></style>