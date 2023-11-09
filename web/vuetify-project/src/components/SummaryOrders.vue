<script setup>
import { getOrders, getPython } from "./communityManager";
import socket from "../plugins/socket.js";
</script>
<script>
export default {
  props: ["users", "products"],
  data() {
    return {
      orders: [],
    };
  },
  async created() {
    this.orders = await getOrders(3);
  },
  methods: {
    getProductsSplit(products) {
      console.log("Productos: " + products);
      const arrayProducts = products.split(",");
      return arrayProducts;
    },
    markDelivered(orderId) {
      socket.emit("updateOrder", { id: orderId, orderStatus: 4 });
      socket.on("orderUpdated", (updatedOrder) => {
        console.log("Orden actualizada:", updatedOrder);
        const indexOrderModified = this.orders.findIndex((order) => order.id === orderId);
        this.orders[indexOrderModified] = updatedOrder;
      });
    },
    async python() {
      try {
        const { productImage, ordersImage } = await getPython();
        this.productImageSrc = productImage;
        this.ordersImageSrc = ordersImage;
        console.log(this.productImageSrc);
        console.log(this.ordersImageSrc);
    } catch (error) {
        console.error('Error al obtener las imágenes:', error);
    }
    }
  },
};
</script>
<template>
  <v-container>
    <v-main>
      <v-row>
        <v-col v-for="order in orders">
          <v-card v-if="order.order_status == 3">
            <v-card-title> NUMERO DE COMANDA: {{ order.id }}</v-card-title>
            <v-parallax style="margin-left: 15px">Estat: Lista para recoger</v-parallax>
            <div v-for="oneProduct in getProductsSplit(order.products)">
              <v-parallax style="margin-left: 15px"> {{ oneProduct }}</v-parallax>
            </div>
            <v-btn color="success" @click="markDelivered(order.id)">Entregada</v-btn>
          </v-card>
        </v-col>
      </v-row>
      <v-btn color="error" @click="python()" style="margin-top: 15px;">Estadistiques</v-btn>
      <div v-if="productImageSrc">
        <img :src="productImageSrc" alt="Productos">
      </div>
      <div v-if="ordersImageSrc">
        <img :src="ordersImageSrc" alt="Pedidos">
      </div>
    </v-main>
  </v-container>
</template>
<style></style>
