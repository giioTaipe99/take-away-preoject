<script setup>
import { deleteOrder, getOrders } from "./communityManager";
import socket from "../plugins/socket.js";
</script>
<script>
export default {
  props: ["users", "products", "callGetOrders"],
  data() {
    return {
      orders: [],
    };
  },
  async created() {
    this.orders = await getOrders(1);
  },
  methods: {
    getOrderStatusText(status) {
      console.log(status);
      if (this.estadoPedido && this.estadoPedido[status]) {
        return this.estadoPedido[status];
      } else {
        return "Desconocido";
      }
    },
    getProductsSplit(products) {
      console.log("Productos: " + products);
      const arrayProducts = products.split(",");
      return arrayProducts;
    },
    async declineOrder(idOrder) {
      await deleteOrder(idOrder);
      this.callGetOrders();
    },
    runOrder(orderId) {
      socket.emit("updateOrder", { id: orderId, orderStatus: 2 });
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
            <v-card-title class="order-item-header">
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
              <v-btn @click="runOrder(order.id)" color="primary">Aceptar</v-btn>
              <v-btn @click="declineOrder(order.id)" color="error">Rebutjar</v-btn>
              <v-btn @click="toggleDetails(order)" color="primary">{{
                order.showDetails ? "Ocultar Detalles" : "Detalls"
              }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-main>
  </v-container>
</template>

<style>
.order-item-header {
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  padding: 10px;
  font-size: 1.2em;
  font-weight: bold;
}
</style>
