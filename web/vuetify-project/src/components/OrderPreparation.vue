<script setup>
import { getOrders } from "./communityManager";
import socket from "../plugins/socket.js";
</script>
<script>
export default {
  props: ["users", "products"],
  data() {
    return {
      orders: [],
      currentTime: new Date(),
    };
  },
  async created() {
    this.orders = await getOrders(2);
    // Actualizar la fecha de actualización cada segundo
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  },
  methods: {
    getProductsSplit(products) {
      const arrayProducts = products.split(",");
      return arrayProducts;
    },
    getOrderColor(dateUpdated) {
      dateUpdated = new Date(dateUpdated);
      const differenceInSeconds = Math.round(
        (this.currentTime.getTime() - dateUpdated.getTime()) / 1000
      );
      if (differenceInSeconds >= 10) {
        return "red"; // Color rojo si han pasado 10 segundos
      } else if (differenceInSeconds >= 5) {
        return "orange"; // Color naranja si han pasado 5 segundos
      } else {
        return "green"; // Color verde si han pasado menos de 5 segundos
      }
    },
    markReadyForPickup(orderId) {
      socket.emit("updateOrder", { id: orderId, orderStatus: 3 });
      socket.on("orderUpdated", (updatedOrder) => {
        console.log("Orden actualizada:", updatedOrder);
        const indexOrderModified = this.orders.findIndex((order) => order.id === orderId);
        if (indexOrderModified !== -1) {
          this.orders.splice(indexOrderModified, 1);
        }
      });
    },
    toggleDetails(order) {
      order.showDetails = !order.showDetails;
    },
  },
};
</script>
<template>
  <v-container>
    <v-main>
      <v-row>
        <v-col v-for="order in orders" :key="order.id" cols="12" sm="6" md="4">
          <v-card>
            <v-card-title :style="{ color: getOrderColor(order.dateUpdated) }">
              NUMERO DE COMANDA: {{ order.id }}
            </v-card-title>

            <v-card-text v-if="order.showDetails">
              <div
                v-for="oneProduct in getProductsSplit(order.products)"
                :key="oneProduct.id"
              >
                {{ oneProduct }}
              </div>
            </v-card-text>

            <v-card-actions>
              <v-btn color="primary" @click="markReadyForPickup(order.id)"
                >Listo para recoger</v-btn
              >
              <v-btn @click="toggleDetails(order)" color="primary">{{
                order.showDetails ? "Ocultar Detalles" : "Detalles"
              }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-main>
  </v-container>
</template>


