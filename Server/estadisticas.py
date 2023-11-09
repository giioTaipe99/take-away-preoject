import pandas as pd
import matplotlib.pyplot as plt
import json
import os

# Ruta completa del archivo countProducts.json
script_dir = os.path.dirname(os.path.abspath(__file__))
file_path_products = os.path.join(script_dir, 'datosJson', 'countProducts.json')

# Leer datos desde el archivo countProducts.json
with open(file_path_products) as file:
    data_products = json.load(file)

# Extraer los valores de id_products y cantidad_total_productos
id_products = [entry['id_products'] for entry in data_products]
cantidad_total_productos = [entry['cantidad_total_productos'] for entry in data_products]

# Crear la primera gráfica de barras
plt.figure()  # Crear una nueva figura
plt.bar(id_products, cantidad_total_productos, color='blue')
plt.xlabel('ID de Productos')
plt.ylabel('Cantidad Total de Productos')
plt.title('Cantidad Total de Productos por ID')

# Guardar la primera gráfica como PNG
plt.savefig('product.png')

# Ruta completa del archivo countOrders.json
script_dir = os.path.dirname(os.path.abspath(__file__))
file_path_orders = os.path.join(script_dir, 'datosJson', 'countOrders.json')

# Leer datos desde el archivo countOrders.json
with open(file_path_orders) as file:
    data_orders = json.load(file)

# Diccionario para representar los días de la semana. Los días los recojo en la base de datos y utilizo un diccionario en inglés
dias_semana = {
    1: 'Diumenge',
    2: 'Dilluns',
    3: 'Dimarts',
    4: 'Dimecres',
    5: 'Dijous',
    6: 'Divendres',
    7: 'Dissabte'
}

# Extraer los valores
dia_semana = [entry['dia_semana'] for entry in data_orders]
nombres_dias = [dias_semana[dia] for dia in dia_semana]
total_orders = [entry['total_orders'] for entry in data_orders]

# Crear la segunda gráfica de barras
plt.figure()  # Crear una nueva figura
plt.bar(nombres_dias, total_orders, color='green')
plt.xlabel('Día de la Semana')
plt.ylabel('Cantidad Total de Pedidos')
plt.title('Cantidad Total de Pedidos por Día de la Semana')

# Guardar la segunda gráfica como PNG
plt.savefig('orders.png')
print("Guardado")
