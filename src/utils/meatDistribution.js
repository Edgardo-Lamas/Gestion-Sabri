/**
 * Calcula la distribución de ganancia en una venta de carne.
 *
 * @param {Object} input
 * @param {number} input.base_price      - Precio base del producto (carne)
 * @param {number} input.shipping_cost   - Costo logístico (flete)
 * @param {number} input.sale_price      - Precio de venta al cliente final
 * @param {number} input.partner_share_percentage - % de ganancia para el socio (Sabry)
 * @returns {Object} Distribución calculada
 */
export const calculateMeatSaleDistribution = ({
    base_price,
    shipping_cost,
    sale_price,
    partner_share_percentage,
}) => {
    const total_cost = base_price + shipping_cost;
    const total_profit = sale_price - total_cost;
    const partner_profit = total_profit * (partner_share_percentage / 100);
    const supplier_profit = total_profit - partner_profit;
    const supplier_total_return = total_cost + supplier_profit;

    return {
        total_cost,
        sale_price,
        total_profit,
        partner_profit,
        supplier_profit,
        supplier_total_return,
    };
};
