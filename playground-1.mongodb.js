/* global use, db */

// For more documentation on playgrounds please refer to
// https://www.mongodb.com/docs/mongodb-vscode/playgrounds/

// Select the database to use.
use('mongodbVSCodePlaygroundDB');

// RELACIONES ENTRE TABLAS

// RELACIÓN 1: Pedidos con información del cliente
db.pedidos.aggregate([
  {
    $lookup: {
      from: "clientes",
      localField: "id_cliente",
      foreignField: "id_cliente",
      as: "cliente"
    }
  }
]);

// RELACIÓN 2: Detalles del pedido con nombres y precios de productos
db.detalles_pedido.aggregate([
  {
    $lookup: {
      from: "productos",
      localField: "id_producto",
      foreignField: "id_producto",
      as: "producto"
    }
  }
]);

// REPORTES REQUERIDOS (MINIMO 3)

// REPORTE 1: Productos más vendidos (top 10)
db.detalles_pedido.aggregate([
  { $group: { _id: "$id_producto", total_vendido: { $sum: "$cantidad" } } },
  { $sort: { total_vendido: -1 } },
  { $limit: 10 },
  {
    $lookup: {
      from: "productos",
      localField: "_id",
      foreignField: "id_producto",
      as: "producto"
    }
  }
]);

// REPORTE 2: Total gastado por cliente
db.detalles_pedido.aggregate([
  {
    $lookup: {
      from: "productos",
      localField: "id_producto",
      foreignField: "id_producto",
      as: "producto"
    }
  },
  { $unwind: "$producto" },
  {
    $group: {
      _id: "$id_pedido",
      total_pedido: {
        $sum: { $multiply: ["$cantidad", "$producto.precio"] }
      }
    }
  },
  {
    $lookup: {
      from: "pedidos",
      localField: "_id",
      foreignField: "id_pedido",
      as: "pedido"
    }
  },
  { $unwind: "$pedido" },
  {
    $lookup: {
      from: "clientes",
      localField: "pedido.id_cliente",
      foreignField: "id_cliente",
      as: "cliente"
    }
  }
]);

// REPORTE 3: Cantidad de pedidos por fecha
db.pedidos.aggregate([
  {
    $group: {
      _id: "$fecha_pedido",
      total_pedidos: { $sum: 1 }
    }
  },
  { $sort: { _id: 1 } }
]);
