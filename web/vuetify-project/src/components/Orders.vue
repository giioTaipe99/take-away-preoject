<script setup>
import { deleteOrder } from './communityManager';
</script>
<script>
export default {
    props: ['orders', 'users', 'products', 'callGetOrders'],
    data() {
        return {
        }
    },
    methods: {
        getOrderStatusText(status) {
            console.log(status);
            if (this.estadoPedido && this.estadoPedido[status]) {
                return this.estadoPedido[status];
            } else {
                return 'Desconocido';
            }
        },
        getProductsSplit(products) {
            console.log("Productos: " + products);
            const arrayProducts = products.split(',');
            return arrayProducts;
        },
        async declineOrder(idOrder) {
            await deleteOrder(idOrder);
            this.callGetOrders();
        },
        runOrder() {

        }
    },
}
</script>
<template>
    <v-container>
        <v-main>
            <v-row>
                <v-col v-for="order in orders">
                    <v-card v-if="order.order_status == 1">
                        <v-card-title> NUMERO DE COMANDA: {{ order.id_order }}</v-card-title>
                        <!-- <v-parallax>ESTAT: {{ getOrderStatusText(order.order_status) }}</v-parallax> -->
                        <div v-for="oneProduct in getProductsSplit(order.products)">
                            <v-parallax style="margin-left: 15px;"> {{ oneProduct }}</v-parallax>
                        </div>
                        <v-card-actions>
                            <v-btn @click="runOrder(order.idOrder)" color="primary">Aceptar</v-btn>
                            <v-btn @click="declineOrder(order.id_order)" color="error">Rebutjar</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-col>
            </v-row>
        </v-main>
    </v-container>
    <Preparation v-if="currentPage === 'page3'" :orders="orders" :users="users" :products="products"></Preparation>
</template>