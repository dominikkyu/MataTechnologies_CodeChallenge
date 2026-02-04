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

    async createSale(saleData) {
        return await jsonDataService.createSale(saleData);
    }
}

module.exports = new DatabaseService();