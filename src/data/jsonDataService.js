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



    /* Read Operations */
    async getAllCustomers() {
        const data = await this.loadData();
        return [...data.customers];
    }

    async getAllProducts() {
        const data = await this.loadData();
        return [...data.products];
    }

    async getAllSales() {
        const data = await this.loadData();
        return [...data.sales];
    }

}

module.exports = new JsonDataService();