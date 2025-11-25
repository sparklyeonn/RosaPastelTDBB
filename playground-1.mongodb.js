/* global use, db */

// Seleccionar la base de datos
use("RosaPastel");

//
// 1️⃣ VERIFICAR QUE LOS DATOS EXISTEN
//
db.clientes.countDocuments();
db.productos.countDocuments();
db.pedidos.countDocuments();
db.detalles_pedido.countDocuments();

db.getName();  // Debe mostrar: "RosaPastel"

db.detalles_pedido.countDocuments();
db.detalles_pedido.findOne();

// ---------------------------------------------------------------------------
// 2️⃣ RELACIONES ENTRE COLECCIONES
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// 3️⃣ REPORTES REQUERIDOS
// ---------------------------------------------------------------------------

// REPORTE 1: Productos más vendidos (Top 10)
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
