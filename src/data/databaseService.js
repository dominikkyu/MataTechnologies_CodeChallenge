/* Database service abstraction to provide consistent interface regardless of data source */

const jsonDataService = require('./jsonDataService');


class DatabaseService {
    
    /* Customer Operations */
    async getAllCustomers() {
        return await jsonDataService.getAllCustomers();
    }

    async getCustomerById(id) {
        return await jsonDataService.getCustomerById(id);
    }

    async getCustomerByEmail(email) {
        return await jsonDataService.getCustomerByEmail(email);
    }

    async createCustomer(customerData) {
        return await jsonDataService.createCustomer(customerData);
    }


    /* Product Operations */
    async getAllProducts() {
        return await jsonDataService.getAllProducts();
    }

    async getProductById(id) {
        return await jsonDataService.getProductById(id);
    }

    async createProduct(productData) {
        return await jsonDataService.createProduct(productData);
    }
    

    /* Sales Operations */
    async getAllSales() {
        return await jsonDataService.getAllSales();
    }

    async getSaleById(id) {
        return await jsonDataService.getSaleById(id);
    }

    async getSalesByMonth(year, month) {
        return await jsonDataService.getSalesByMonth(year, month);
    }

    async getCompleteSalesData(salesData) {
        return await jsonDataService.getCompleteSalesData(salesData);
    }

    async createSale(saleData) {
        return await jsonDataService.createSale(saleData);
    }

    async getMonthlySalesReport(year, month) {
        const sales = await this.getSalesByMonth(year, month);
        const completeSalesData = await this.getCompleteSalesData(sales);
        
        if (completeSalesData.length === 0) {
            return {
                summary: {
                    year,
                    month: month.toString().padStart(2, '0'),
                    total_sales: 0,
                    total_revenue: 0,
                    unique_customers: 0,
                    unique_products: 0
                },
                customer_purchases: [],
                product_sales: [],
                detailed_sales: []
            };
        }
        
        /* Calculate summary */
        const totalRevenue = completeSalesData.reduce((sum, sale) => sum + sale.total_amount, 0);
        const uniqueCustomers = new Set(completeSalesData.map(s => s.customer_id)).size;
        const uniqueProducts = new Set(completeSalesData.map(s => s.product_id)).size;
        
        /* Group by customer */
        const customerPurchases = {};
        completeSalesData.forEach(sale => {
            const customerKey = `${sale.customer_id}-${sale.customer_name}`;
            if (!customerPurchases[customerKey]) {
                customerPurchases[customerKey] = {
                    customer_id: sale.customer_id,
                    customer_name: sale.customer_name,
                    customer_email: sale.customer_email,
                    total_spent: 0,
                    total_items: 0,
                    purchases: []
                };
            }
            customerPurchases[customerKey].total_spent += sale.total_amount;
            customerPurchases[customerKey].total_items += sale.quantity;
            customerPurchases[customerKey].purchases.push({
                product_id: sale.product_id,
                product_name: sale.product_name,
                quantity: sale.quantity,
                unit_price: sale.unit_price,
                total_amount: sale.total_amount,
                sale_date: sale.sale_date
            });
        });
        
        /* Group by product */
        const productSales = {};
        completeSalesData.forEach(sale => {
            const productKey = `${sale.product_id}-${sale.product_name}`;
            if (!productSales[productKey]) {
                productSales[productKey] = {
                    product_id: sale.product_id,
                    product_name: sale.product_name,
                    product_category: sale.product_category,
                    total_quantity: 0,
                    total_revenue: 0,
                    customers: []
                };
            }
            productSales[productKey].total_quantity += sale.quantity;
            productSales[productKey].total_revenue += sale.total_amount;
            productSales[productKey].customers.push({
                customer_id: sale.customer_id,
                customer_name: sale.customer_name,
                quantity: sale.quantity,
                purchase_amount: sale.total_amount
            });
        });
        
        return {
            summary: {
                year,
                month: month.toString().padStart(2, '0'),
                total_sales: completeSalesData.length,
                total_revenue: parseFloat(totalRevenue.toFixed(2)),
                unique_customers: uniqueCustomers,
                unique_products: uniqueProducts
            },
            customer_purchases: Object.values(customerPurchases),
            product_sales: Object.values(productSales),
            detailed_sales: completeSalesData
        };
    }
}

module.exports = new DatabaseService();