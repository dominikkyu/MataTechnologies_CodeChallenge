const path = require('path');
const fastify = require('fastify')({ 
    logger: true
});

async function startServer() {
    try {
        const salesRoutes = require('./routes/salesRoutes');
                
        /* Register routes */
        await fastify.register(salesRoutes, { prefix: '/api' });
        
        /* Root endpoint */
        fastify.get('/', async (request, reply) => {
            return {
                application: 'Sales API',
                version: '1.0.0',
                description: 'RESTful API for sales data',
                data_source: 'JSON file (src/data/data.json)',
                all_endpoints: [
                    { method: 'GET', path: '/', description: 'Root' },
                    { method: 'GET', path: '/api/sales/monthly?year=YYYY&month=MM', description: 'Monthly sales report' },
                    { method: 'GET', path: '/api/sales', description: 'All sales' },
                    { method: 'GET', path: '/api/customers', description: 'All customers' },
                    { method: 'GET', path: '/api/products', description: 'All products' },
                    { method: 'POST', path: '/api/sales', description: 'Create sale' },
                    { method: 'GET', path: '/api/health', description: 'Health check' },
                ],
                data_structure: {
                    customers: 'Array of customer objects with id, name, email',
                    products: 'Array of product objects with id, name, price, category',
                    sales: 'Array of sale objects linking customers to products'
                }
            };
        });
        
        /* 404 route */
        fastify.setNotFoundHandler((request, reply) => {
            reply.code(404).send({
                error: 'Not Found',
                message: `Route ${request.method}:${request.url} not found`,
                available_routes: [
                    'GET /',
                    'GET /api/sales/monthly?year=YYYY&month=MM',
                    'GET /api/sales',
                    'GET /api/customers',
                    'GET /api/products',
                    'POST /api/sales',
                    'GET /api/health'
                ]
            });
        });
        
        /* Start server */
        const PORT = process.env.PORT || 3000;
        await fastify.listen({ 
            port: PORT, 
            host: '0.0.0.0' 
        });
        
        console.log('Sales API Server Started');
        console.log(`Server: http://localhost:${PORT}`);
        console.log(`Data: ${path.join(__dirname, 'data/data.json')}`);
        console.log('Available Endpoints:');
        console.log('   GET /                                       - Root');
        console.log('   GET /api/sales/monthly?year=YYYY&month=MM   - Monthly sales report');
        console.log('   GET /api/sales                              - All sales');
        console.log('   GET /api/customers                          - All customers');
        console.log('   GET /api/products                           - All products');
        console.log('   POST /api/sales                             - Create sale');
        console.log('   GET /api/health                             - Health check');
        console.log('Data File:');
        console.log(`   ${path.join(__dirname, 'data/data.json')}`);
        
    } catch (err) {
        console.error('Server failed to start:', err.message);
        console.error('Debugging info:');
        console.error('   Current directory:', __dirname);
        console.error('   Error code:', err.code);
        
        process.exit(1);
    }
}

/* Server shutdown */
process.on('SIGINT', () => {
    console.log('Shutting down server...');
    fastify.close(() => {
        console.log('Server stopped');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('Shutting down server...');
    fastify.close(() => {
        console.log('Server stopped');
        process.exit(0);
    });
});

startServer();