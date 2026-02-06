/* Handle HTTP requests and responses */

const databaseService = require('../data/databaseService');

class SalesController {
    
    async getMonthlySales(request, reply) {
        const { year, month } = request.query;
        
        /* Validate required parameters */
        if (!year || !month) {
            return reply.status(400).send({
                error: 'Missing parameters',
                message: 'Both year and month query parameters are required',
                example: '/api/sales/monthly?year=2026&month=1',
                parameters: {
                    year: 'YYYY',
                    month: 'MM (1-12)'
                }
            });
        }
        
        const yearNum = parseInt(year);
        const monthNum = parseInt(month);
        
        /* Validate parameter types and ranges */
        if (isNaN(yearNum) || isNaN(monthNum)) {
            return reply.status(400).send({
                error: 'Invalid parameters',
                message: 'Year and month must be valid numbers'
            });
        }
        
        if (yearNum < 1900 || yearNum > 2100) {
            return reply.status(400).send({
                error: 'Invalid year',
                message: 'Year must be between 1900 and 2100'
            });
        }
        
        if (monthNum < 1 || monthNum > 12) {
            return reply.status(400).send({
                error: 'Invalid month',
                message: 'Month must be between 1 and 12'
            });
        }
        
        try {
            const result = await databaseService.getMonthlySalesReport(yearNum, monthNum);
            
            return reply.send({
                ...result,
                query: {
                    year: yearNum,
                    month: monthNum,
                },
                success: true,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({
                error: 'Internal server error',
                message: 'Failed to retrieve monthly sales data',
                details: error.message
            });
        }
    }

    async getAllSales(request, reply) {
        try {
            const sales = await databaseService.getAllSales();
            const completeSalesData = await databaseService.getCompleteSalesData(sales);
            
            return reply.send({
                count: completeSalesData.length,
                sales: completeSalesData,
                success: true,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({
                error: 'Internal server error',
                message: 'Failed to retrieve sales data'
            });
        }
    }

    async createCustomer(request, reply) {
        const { name, email } = request.body;
        
        if (!name || !email) {
            return reply.status(400).send({
                error: 'Bad request',
                message: 'Missing required fields: name and email are required',
                required_fields: ['name', 'email']
            });
        }
        
        /* Validate email format */
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return reply.status(400).send({
                error: 'Bad request',
                message: 'Invalid email format'
            });
        }
        
        try {
            /* Check if email already exists */
            const existingCustomer = await databaseService.getCustomerByEmail(email);
            
            if (existingCustomer) {
                return reply.status(400).send({
                    error: 'Bad request',
                    message: `Customer with email ${email} already exists`
                });
            }

            const newCustomer = await databaseService.createCustomer(request.body);
            
            return reply.status(201).send({
                message: 'Customer created successfully',
                customer: newCustomer,
                success: true,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            request.log.error(error);
            
            if (error.message.includes('duplicate') || error.message.includes('already exists')) {
                return reply.status(400).send({
                    error: 'Bad request',
                    message: error.message
                });
            }
            
            return reply.status(500).send({
                error: 'Internal server error',
                message: 'Failed to create customer'
            });
        }
    }
    
    async createProduct(request, reply) {
        const { name, price, category } = request.body;
        
        if (!name || price === undefined || !category) {
            return reply.status(400).send({
                error: 'Bad request',
                message: 'Missing required fields: name, price, and category are required',
                required_fields: ['name', 'price', 'category']
            });
        }
        
        /* Validate price is positive number */
        if (typeof price !== 'number' || price <= 0) {
            return reply.status(400).send({
                error: 'Bad request',
                message: 'Price must be a positive number'
            });
        }
        
        try {
            const newProduct = await databaseService.createProduct(request.body);
            
            return reply.status(201).send({
                message: 'Product created successfully',
                product: newProduct,
                success: true,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            request.log.error(error);
            
            if (error.message.includes('duplicate') || error.message.includes('already exists')) {
                return reply.status(400).send({
                    error: 'Bad request',
                    message: error.message
                });
            }
            
            return reply.status(500).send({
                error: 'Internal server error',
                message: 'Failed to create product'
            });
        }
    }
    
    async createSale(request, reply) {
        const { customerId, productId, quantity, saleDate } = request.body;
        
        if (!customerId || !productId || !quantity || !saleDate) {
            return reply.status(400).send({
                error: 'Bad request',
                message: 'Missing required fields: customerId, productId, quantity, and saleDate are all required',
                required_fields: ['customerId', 'productId', 'quantity', 'saleDate']
            });
        }
        
        /* Validate field types */
        if (typeof customerId !== 'number' || typeof productId !== 'number' || typeof quantity !== 'number') {
            return reply.status(400).send({
                error: 'Bad request',
                message: 'Invalid field types: customerId, productId, and quantity must be numbers'
            });
        }
        
        /* Validate quantity is positive */
        if (quantity <= 0) {
            return reply.status(400).send({
                error: 'Bad request',
                message: 'Invalid quantity: quantity must be greater than 0'
            });
        }
        
        try {
            const newSale = await databaseService.createSale(request.body);
            
            return reply.status(201).send({
                message: 'Sale created successfully',
                sale: newSale,
                success: true,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            request.log.error(error);
            
            if (error.message.includes('not found') || error.message.includes('Missing required')) {
                return reply.status(400).send({
                    error: 'Bad request',
                    message: error.message
                });
            }
            
            return reply.status(500).send({
                error: 'Internal server error',
                message: 'Failed to create sale'
            });
        }
    }
    
    async getAllCustomers(request, reply) {
        try {
            const customers = await databaseService.getAllCustomers();
            
            return reply.send({
                count: customers.length,
                customers: customers,
                success: true,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({
                error: 'Internal server error',
                message: 'Failed to retrieve customers'
            });
        }
    }
    
    async getAllProducts(request, reply) {
        try {
            const products = await databaseService.getAllProducts();
            
            return reply.send({
                count: products.length,
                products: products,
                success: true,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({
                error: 'Internal server error',
                message: 'Failed to retrieve products'
            });
        }
    }

    async getHealth(request, reply) {
        try {
            const customers = await databaseService.getAllCustomers();
            const products = await databaseService.getAllProducts();
            const sales = await databaseService.getAllSales();
            
            return reply.send({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                database: {
                    customers: customers.length,
                    products: products.length,
                    sales: sales.length
                },
                uptime: process.uptime(),
                memory: process.memoryUsage()
            });
            
        } catch (error) {
            request.log.error(error);
            return reply.status(503).send({
                status: 'unhealthy',
                error: 'Database connection failed',
                message: error.message
            });
        }
    }

}

module.exports = new SalesController();