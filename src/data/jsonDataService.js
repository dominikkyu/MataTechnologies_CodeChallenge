/* Handle data operations from JSON file */

const fs = require('fs').promises;
const path = require('path');


class JsonDataService {

    /* Default to src/data/data.json or use provided path */
    constructor(dataFilePath = null) {
        
        this.dataFilePath = dataFilePath || path.join(__dirname, 'data.json');
    }

    /* Load data from JSON file */
    async loadData() {
        try {
            const fileContent = await fs.readFile(this.dataFilePath, 'utf8');
            return JSON.parse(fileContent);
        } catch (error) {
            if (error.code === 'ENOENT') {
                /* If file does not exist, return empty structure*/
                return { customers: [], products: [], sales: [] };
            }
            throw new Error(`Failed to load data: ${error.message}`);
        }
    }

    /* Save data to JSON file */
    async saveData(data) {
        const dataToSave = JSON.stringify(data, null, 2);
        await fs.writeFile(this.dataFilePath, dataToSave, 'utf8');
    }



    /* Customer Operations */
    async getAllCustomers() {
        const data = await this.loadData();
        return [...data.customers];
    }

    async getCustomerById(id) {
        const customers = await this.getAllCustomers();
        return customers.find(customer => customer.id === id) || null;
    }

    async addCustomer(customerData) {
        const data = await this.loadData();
        const newId = data.customers.length > 0 ?
            Math.max(...data.customers.map(c => c.id)) + 1 
            : 1;
        
        const newCustomer = {
            id: newId,
            ...customerData,
        };
        
        data.customers.push(newCustomer);
        await this.saveData();
        
        return newCustomer;
    }


    /* Product Operations */
    async getAllProducts() {
        const data = await this.loadData();
        return [...data.products];
    }

    async getProductById(id) {
        const products = await this.getAllProducts();
        return products.find(product => product.id === id) || null;
    }
    
    async addProduct(productData) {
        const data = await this.loadData();
        const newId = data.products.length > 0 ?
            Math.max(...data.products.map(p => p.id)) + 1 
            : 1;
        
        const newProduct = {
            id: newId,
            ...productData,
        };
        
        data.products.push(newProduct);
        await this.saveData();
        
        return newProduct;
    }

    /* Sales Operations */
    async getAllSales() {
        const data = await this.loadData();
        return [...data.sales];
    }

    async getSaleById(id) {
        const sales = await this.getAllSales();
        return sales.find(sale => sale.id === id) || null;
    }

    async getSalesByMonth(year, month) {
        const sales = await this.getAllSales();
        
        return sales.filter(sale => {
            const saleDate = new Date(sale.saleDate);
            return saleDate.getFullYear() === year && saleDate.getMonth() + 1 === month;
        });
    }

    /* Get sales data with customer and product details included */
    async getCompleteSalesData(salesData) {
        if (!salesData || salesData.length === 0) {
            return [];
        }
        
        const completeSalesData = [];
        
        for (const sale of salesData) {
            const customer = await this.getCustomerById(sale.customerId);
            const product = await this.getProductById(sale.productId);
            
            completeSalesData.push({
                sale_id: sale.id,
                sale_date: sale.saleDate,
                quantity: sale.quantity,
                total_amount: sale.totalAmount,
                customer_id: sale.customerId,
                customer_name: customer ? customer.name : 'Unknown Customer',
                customer_email: customer ? customer.email : '',
                product_id: sale.productId,
                product_name: product ? product.name : 'Unknown Product',
                unit_price: product ? product.price : 0,
                product_category: product ? product.category : ''
            });
        }
        
        return completeSalesData;
    }

    async addSale(saleData) {
        const data = await this.loadData();
        const newId = data.sales.length > 0 ?
            Math.max(...data.sales.map(p => p.id)) + 1 
            : 1;
        
        const newSale = {
            id: newId,
            ...saleData,
        };
        
        data.products.push(newSale);
        await this.saveData();
        
        return newProduct;
    }
}

module.exports = new JsonDataService();