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
            const result = await databaseService.getMonthlySalesSummary(yearNum, monthNum);
            
            return reply.send({
                ...result,
                query: {
                    year: yearNum,
                    month: monthNum,
                    formatted_month: result.summary.month
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
}

module.exports = new SalesController();