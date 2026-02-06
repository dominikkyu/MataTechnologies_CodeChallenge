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
    
    async createSale(request, reply) {
        const { customerId, productId, quantity, saleDate } = request.body;
        
        if (!customerId || !productId || !quantity || !saleDate) {
            return reply.status(400).send({
                error: 'Bad request',
                message: 'Missing required fields: customerId, productId, quantity, and saleDate are all required',
                required_fields: ['customerId', 'productId', 'quantity', 'saleDate']
            });
        }
        
        // Validate field types
        if (typeof customerId !== 'number' || typeof productId !== 'number' || typeof quantity !== 'number') {
            return reply.status(400).send({
                error: 'Bad request',
                message: 'Invalid field types: customerId, productId, and quantity must be numbers'
            });
        }
        
        // Validate quantity is positive
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
}

module.exports = new SalesController();