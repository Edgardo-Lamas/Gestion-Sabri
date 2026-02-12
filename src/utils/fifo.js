/**
 * Implementación exacta del algoritmo de venta FIFO solicitado.
 * 
 * @param {number} cantidad_vendida - Cantidad total a vender.
 * @param {Array} lotes_compra - Compras del producto ordenadas por fecha ASC con cantidad_disponible > 0.
 * @returns {Object} { lotes_actualizados, costo_total }
 */
export const ejecutarAlgoritmoVentaFIFO = (cantidad_vendida, lotes_compra) => {
  // 1. Tomar la cantidad_vendida como cantidad_restante
  let cantidad_restante = cantidad_vendida;
  let costo_total = 0;
  const lotes_actualizados = [...lotes_compra];

  // 3. Para cada compra (lote) encontrada:
  for (let i = 0; i < lotes_actualizados.length; i++) {
    // Si cantidad_restante es 0, detener el proceso
    if (cantidad_restante <= 0) break;

    const compra = lotes_actualizados[i];

    // Tomar la menor cantidad entre cantidad_restante y compra.cantidad_disponible
    const cantidad_tomada = Math.min(cantidad_restante, compra.cantidad_disponible);

    // Sumar al costo_total: cantidad_tomada * compra.costo_unitario
    costo_total += cantidad_tomada * compra.costo_unitario;

    // Restar cantidad_tomada de compra.cantidad_disponible
    lotes_actualizados[i] = {
      ...compra,
      cantidad_disponible: compra.cantidad_disponible - cantidad_tomada
    };

    // Restar cantidad_tomada de cantidad_restante
    cantidad_restante -= cantidad_tomada;
  }

  if (cantidad_restante > 0) {
    throw new Error('Stock insuficiente');
  }

  return { lotes_actualizados, costo_total };
};
