<script>
    export default {
  props: ['orders', 'users', 'products'],
}
</script>
<template>
    <v-container>
            <v-main>
                <v-card v-for="order in orders">
                    <div v-for="user in users" :key="user.id">
                        <v-parallax if="order.user_id === user.id">{{ user.first_name }} {{ user.last_name }} {{ user.mail }}</v-parallax>
                    </div>
                    <div v-for="product in products" :key="product.id">
                        <v-parallax if="order.product_id === product.id">{{ product.name }}</v-parallax>
                    </div>
                    <div>
                        <v-parallax>{{ order.quantity }} {{ order.total_price }}</v-parallax>
                    </div>  
                </v-card>                            
            </v-main>
        </v-container>
</template>