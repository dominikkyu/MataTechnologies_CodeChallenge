const fastify = require('fastify')({ 
    logger: true 
});

async function start() {
    try {
        const PORT = process.env.PORT || 3000;
        await fastify.listen({ port: PORT, host: '0.0.0.0' });
        
        console.log(`Server running on http://localhost:${PORT}`);
        
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}

start();