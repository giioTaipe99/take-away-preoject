<script setup></script>
<script>
export default {
    props: ['orders', 'users', 'products', 'callGetOrders'],
    data() {
        return {
            estadoPedido: {
                1: 'Recibida',
                2: 'En preparación',
                3: 'Lista para recoger',
                4: 'Recogida'
            },
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
    }
}
</script>
<template>
     <v-container>
            <v-main>
                <v-row>
                    <v-col v-for="order in orders">
                        <v-card v-if="order.order_status == 3">
                            <v-card-title> NUMERO DE COMANDA: {{ order.id_order }}</v-card-title>
                            <v-parallax style="margin-left: 15px;">Estat: {{ getOrderStatusText(order.order_status) }}</v-parallax>
                            <div v-for="oneProduct in getProductsSplit(order.products)">
                                <v-parallax style="margin-left: 15px;"> {{ oneProduct }}</v-parallax>
                            </div>
                        </v-card>
                    </v-col>
                </v-row>
            </v-main>
        </v-container>
</template> 
<style></style>