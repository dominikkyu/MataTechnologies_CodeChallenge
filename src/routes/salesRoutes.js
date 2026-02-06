/* Define HTTP routes and validation schemas */

const salesController = require('../controllers/salesController');


const monthlySalesSchema = {
    schema: {
        description: 'Get sales data for a specific month',
        tags: ['sales'],
        summary: 'Returns which customer bought which products during a particular month',
        querystring: {
            type: 'object',
            required: ['year', 'month'],
            properties: {
                year: {
                    type: 'string',
                    description: 'Year (4 digits, 1900-2100)',
                    pattern: '^\\d{4}$',
                    examples: ['2024']
                },
                month: {
                    type: 'string',
                    description: 'Month (1-12)',
                    pattern: '^([1-9]|1[0-2])$',
                    examples: ['2']
                }
            }
        },
        response: {
            200: {
                description: 'Successful response',
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    timestamp: { type: 'string' },
                    query: {
                        type: 'object',
                        properties: {
                            year: { type: 'integer' },
                            month: { type: 'integer' }
                        }
                    },
                    summary: {
                        type: 'object',
                        properties: {
                            year: { type: 'integer' },
                            month: { type: 'string' },
                            total_sales: { type: 'integer' },
                            total_revenue: { type: 'number' },
                            unique_customers: { type: 'integer' },
                            unique_products: { type: 'integer' }
                        }
                    },
                    customer_purchases: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                customer_id: { type: 'integer' },
                                customer_name: { type: 'string' },
                                customer_email: { type: 'string' },
                                total_spent: { type: 'number' },
                                total_items: { type: 'integer' },
                                purchases: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            product_id: { type: 'integer' },
                                            product_name: { type: 'string' },
                                            quantity: { type: 'integer' },
                                            unit_price: { type: 'number' },
                                            total_amount: { type: 'number' },
                                            sale_date: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    product_sales: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                product_id: { type: 'integer' },
                                product_name: { type: 'string' },
                                product_category: { type: 'string' },
                                total_quantity: { type: 'integer' },
                                total_revenue: { type: 'number' },
                                customers: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            customer_id: { type: 'integer' },
                                            customer_name: { type: 'string' },
                                            quantity: { type: 'integer' },
                                            purchase_amount: { type: 'number' }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    detailed_sales: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                sale_id: { type: 'integer' },
                                sale_date: { type: 'string' },
                                quantity: { type: 'integer' },
                                total_amount: { type: 'number' },
                                customer_id: { type: 'integer' },
                                customer_name: { type: 'string' },
                                customer_email: { type: 'string' },
                                product_id: { type: 'integer' },
                                product_name: { type: 'string' },
                                unit_price: { type: 'number' },
                                product_category: { type: 'string' }
                            }
                        }
                    }
                }
            },
            400: {
                description: 'Bad request',
                type: 'object',
                properties: {
                    error: { type: 'string' },
                    message: { type: 'string' },
                    example: { type: 'string' },
                    parameters: {
                        type: 'object',
                        properties: {
                            year: { type: 'string' },
                            month: { type: 'string' }
                        }
                    }
                }
            },
            500: {
                description: 'Internal server error',
                type: 'object',
                properties: {
                    error: { type: 'string' },
                    message: { type: 'string' },
                    details: { type: 'string' }
                }
            }
        }
    }
};

const createCustomerSchema = {
    schema: {
        description: 'Create a new customer',
        tags: ['customers'],
        body: {
            type: 'object',
            required: ['name', 'email'],
            properties: {
                name: {
                    type: 'string',
                    description: 'Customer name',
                    minLength: 2,
                    maxLength: 100
                },
                email: {
                    type: 'string',
                    description: 'Customer email',
                    format: 'email'
                }
            }
        },
        response: {
            201: {
                description: 'Customer created successfully',
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    customer: {
                        type: 'object',
                        properties: {
                            id: { type: 'integer' },
                            name: { type: 'string' },
                            email: { type: 'string' }
                        }
                    },
                    timestamp: { type: 'string' }
                }
            },
            400: {
                description: 'Bad request',
                type: 'object',
                properties: {
                    error: { type: 'string' },
                    message: { type: 'string' },
                    required_fields: {
                        type: 'array',
                        items: { type: 'string' }
                    }
                }
            },
            500: {
                description: 'Internal server error',
                type: 'object',
                properties: {
                    error: { type: 'string' },
                    message: { type: 'string' }
                }
            }
        }
    }
};

const createProductSchema = {
    schema: {
        description: 'Create a new product',
        tags: ['products'],
        body: {
            type: 'object',
            required: ['name', 'price'],
            properties: {
                name: {
                    type: 'string',
                    description: 'Product name',
                    minLength: 2,
                    maxLength: 100
                },
                price: {
                    type: 'number',
                    description: 'Product price',
                    minimum: 0.01
                },
                category: {
                    type: 'string',
                    description: 'Product category',
                    maxLength: 50
                },
                description: {
                    type: 'string',
                    description: 'Product description',
                    maxLength: 500
                }
            }
        },
        response: {
            201: {
                description: 'Product created successfully',
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    product: {
                        type: 'object',
                        properties: {
                            id: { type: 'integer' },
                            name: { type: 'string' },
                            price: { type: 'number' },
                            category: { type: 'string' },
                            description: { type: 'string' }
                        }
                    },
                    timestamp: { type: 'string' }
                }
            },
            400: {
                description: 'Bad request',
                type: 'object',
                properties: {
                    error: { type: 'string' },
                    message: { type: 'string' },
                    required_fields: {
                        type: 'array',
                        items: { type: 'string' }
                    }
                }
            },
            500: {
                description: 'Internal server error',
                type: 'object',
                properties: {
                    error: { type: 'string' },
                    message: { type: 'string' }
                }
            }
        }
    }
};

const createSaleSchema = {
    schema: {
        description: 'Create a new sale record',
        tags: ['sales'],
        body: {
            type: 'object',
            required: ['customerId', 'productId', 'quantity', 'saleDate'],
            properties: {
                customerId: {
                    type: 'integer',
                    description: 'Customer ID',
                    minimum: 1
                },
                productId: {
                    type: 'integer',
                    description: 'Product ID',
                    minimum: 1
                },
                quantity: {
                    type: 'integer',
                    description: 'Quantity purchased',
                    minimum: 1
                },
                saleDate: {
                    type: 'string',
                    description: 'Sale date (YYYY-MM-DD)',
                    pattern: '^\\d{4}-\\d{2}-\\d{2}$'
                }
            }
        },
        response: {
            201: {
                description: 'Sale created successfully',
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    sale: {
                        type: 'object',
                        properties: {
                            id: { type: 'integer' },
                            customerId: { type: 'integer' },
                            productId: { type: 'integer' },
                            quantity: { type: 'integer' },
                            saleDate: { type: 'string' },
                            totalAmount: { type: 'number' }
                        }
                    },
                    timestamp: { type: 'string' }
                }
            },
            400: {
                description: 'Bad request',
                type: 'object',
                properties: {
                    error: { type: 'string' },
                    message: { type: 'string' },
                    required_fields: {
                        type: 'array',
                        items: { type: 'string' }
                    }
                }
            },
            500: {
                description: 'Internal server error',
                type: 'object',
                properties: {
                    error: { type: 'string' },
                    message: { type: 'string' }
                }
            }
        }
    }
}

const healthCheckSchema = {
    schema: {
        description: 'Health check endpoint',
        tags: ['system'],
        summary: 'Check if the API and database are healthy',
        response: {
            200: {
                description: 'System is healthy',
                type: 'object',
                properties: {
                    status: { type: 'string' },
                    timestamp: { type: 'string' },
                    database: {
                        type: 'object',
                        properties: {
                            customers: { type: 'integer' },
                            products: { type: 'integer' },
                            sales: { type: 'integer' }
                        }
                    },
                    uptime: { type: 'number' },
                    memory: {
                        type: 'object',
                        properties: {
                            rss: { type: 'number' },
                            heapTotal: { type: 'number' },
                            heapUsed: { type: 'number' },
                            external: { type: 'number' },
                            arrayBuffers: { type: 'number' }
                        }
                    }
                }
            },
            503: {
                description: 'System is unhealthy',
                type: 'object',
                properties: {
                    status: { type: 'string' },
                    error: { type: 'string' },
                    message: { type: 'string' }
                }
            }
        }
    }
};

async function salesRoutes(fastify, options) {
    fastify.get('/customers', salesController.getAllCustomers);
    fastify.get('/products', salesController.getAllProducts);
    fastify.get('/sales', salesController.getAllSales);
    fastify.get('/sales/monthly', monthlySalesSchema, salesController.getMonthlySales);

    fastify.post('/customers', createCustomerSchema, salesController.createCustomer);
    fastify.post('/products', createProductSchema, salesController.createProduct);
    fastify.post('/sales', createSaleSchema, salesController.createSale);

    fastify.get('/health', healthCheckSchema, salesController.getHealth);
}

module.exports = salesRoutes;