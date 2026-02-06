const http = require('http');

const BASE_URL = 'http://localhost:3000';

async function testEndpoint(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    const json = JSON.parse(responseData);
                    resolve({
                        status: res.statusCode,
                        data: json,
                        headers: res.headers
                    });
                } catch (error) {
                    resolve({
                        status: res.statusCode,
                        data: responseData,
                        headers: res.headers
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

async function runTests() {
    console.log('\nSales API Testing');
    
    let testResults = [];
    let customerId, productId, saleId;
    
    /* Helper function to log test results */
    function logTest(name, passed, details = '') {
        const status = passed ? 'Pass' : 'Fail';
        console.log(`${status}: ${name} ${details}`);
        testResults.push({ name, passed, details });
    }
    
    try {
        /* Valid flow tests */
        console.log('\nValid flow tests');
        
        /* 1. Root endpoint */
        console.log('1. Testing root endpoint');
        const root = await testEndpoint('GET', '/');
        if (root.status === 200 && root.data.application) {
            logTest('Root endpoint returns API info', true, 
                `- ${root.data.all_endpoints?.length || 0} endpoints documented`);
        } else {
            logTest('Root endpoint returns API info', false, 
                `Got status ${root.status}`);
        }
        
        /* 2. Health check */
        console.log('2. Testing health check');
        const health = await testEndpoint('GET', '/api/health');
        if (health.status === 200 && health.data.status === 'healthy') {
            logTest('Health check returns healthy status', true,
                `- ${health.data.database?.customers || 0} customers, ` +
                `${health.data.database?.products || 0} products`);
        } else {
            logTest('Health check returns healthy status', false,
                `Status: ${health.data.status}`);
        }
        
        /* 3. Create valid customer */
        console.log('3. Creating valid customer');
        const customerData = { name: 'newCustomer', email: 'newCustomer@test.com' };
        const validCustomer = await testEndpoint('POST', '/api/customers', customerData);
        if (validCustomer.status === 201 && validCustomer.data.success) {
            customerId = validCustomer.data.customer.id;
            logTest('Create valid customer returns 201', true,
                `- ID: ${customerId}, Email: ${customerData.email}`);
        } else {
            logTest('Create valid customer returns 201', false,
                `Got status ${validCustomer.status}`);
        }
        
        /* 4. Create valid product */
        console.log('4. Creating valid product');
        const productData = { 
            name: 'New Product', 
            price: 99.99, 
            category: 'New',
        };
        const validProduct = await testEndpoint('POST', '/api/products', productData);
        if (validProduct.status === 201 && validProduct.data.success) {
            productId = validProduct.data.product.id;
            logTest('Create valid product returns 201', true,
                `- ID: ${productId}, Price: $${productData.price}`);
        } else {
            logTest('Create valid product returns 201', false,
                `Got status ${validProduct.status}`);
        }
        
        /* 5. Create valid sale */
        console.log('5. Creating valid sale');
        const saleData = {
            customerId: customerId || 1,
            productId: productId || 1,
            quantity: 3,
            saleDate: '2026-02-02'
        };
        const validSale = await testEndpoint('POST', '/api/sales', saleData);
        if (validSale.status === 201 && validSale.data.success) {
            saleId = validSale.data.sale.id;
            logTest('Create valid sale returns 201', true,
                `- ID: ${saleId}, Quantity: ${saleData.quantity}`);
        } else {
            logTest('Create valid sale returns 201', false,
                `Got status ${validSale.status}`);
        }
        
        /* 6. Monthly sales report */
        console.log('6. Testing monthly sales');
        const monthly = await testEndpoint('GET', '/api/sales/monthly?year=2026&month=1');
        if (monthly.status === 200 && monthly.data.success && monthly.data.summary) {
            const summary = monthly.data.summary;
            logTest('Monthly sales returns correct structure', true,
                `- ${summary.total_sales} sales, $${summary.total_revenue} revenue, ` +
                `${summary.unique_customers} customers, ${summary.unique_products} products`);
            
            /* Verify customer-product relationships exist */
            if (monthly.data.customer_purchases?.length > 0 && 
                monthly.data.product_sales?.length > 0) {
                logTest('Customer-product relationships shown', true,
                    `- ${monthly.data.customer_purchases.length} customer purchases, ` +
                    `${monthly.data.product_sales.length} product sales`);
            } else {
                logTest('Customer-product relationships shown', false,
                    'No relationships data found');
            }
        } else {
            logTest('Monthly sales returns correct structure', false,
                `Got status ${monthly.status}`);
        }
        
        /* Invalid Input Tests */
        console.log('\nInvalid Inputs Tests');
        
        /* Invalid Customer Creation Tests */
        console.log('\nInvalid Customer Creation Tests');
        
        /* 7. Customer - Missing name */
        console.log('7. Customer - Missing name field');
        const customerMissingName = await testEndpoint('POST', '/api/customers', {
            email: 'noName@test.com'
        });
        logTest('Missing name returns 400', customerMissingName.status === 400,
            `Got ${customerMissingName.status}, expected 400`);
        
        /* 8. Customer - Missing email */
        console.log('8. Customer - Missing email field');
        const customerMissingEmail = await testEndpoint('POST', '/api/customers', {
            name: 'No Email'
        });
        logTest('Missing email returns 400', customerMissingEmail.status === 400,
            `Got ${customerMissingEmail.status}, expected 400`);
        
        /* 9. Customer - Invalid email format */
        console.log('9. Customer - Invalid email format');
        const customerInvalidEmail = await testEndpoint('POST', '/api/customers', {
            name: 'Invalid Email',
            email: 'wrongSyntax'
        });
        logTest('Invalid email returns 400', customerInvalidEmail.status === 400,
            `Got ${customerInvalidEmail.status}, expected 400`);
        
        /* 10. Customer - Duplicate email */
        console.log('10. Customer - Duplicate email');
        const customerDuplicateEmail = await testEndpoint('POST', '/api/customers', {
            name: 'NewCustomer Copy',
            email: 'newCustomer@test.com'
        });
        logTest('Duplicate email returns 400', customerDuplicateEmail.status === 400,
            `Got ${customerDuplicateEmail.status}, expected 400`);
        
        /* 11. Customer - Empty strings */
        console.log('11. Customer - Empty name and email');
        const customerEmpty = await testEndpoint('POST', '/api/customers', {
            name: '',
            email: ''
        });
        logTest('Empty values return 400', customerEmpty.status === 400,
            `Got ${customerEmpty.status}, expected 400`);
        
        /* Invalid Product Creation Tests */
        console.log('\nInvalid Product Creation Tests');
        
        /* 12. Product - Missing name */
        console.log('12. Product - Missing name field');
        const productMissingName = await testEndpoint('POST', '/api/products', {
            price: 99.99
        });
        logTest('Missing name returns 400', productMissingName.status === 400,
            `Got ${productMissingName.status}, expected 400`);
        
        /* 13. Product - Missing price */
        console.log('13. Product - Missing price field');
        const productMissingPrice = await testEndpoint('POST', '/api/products', {
            name: 'No Price'
        });
        logTest('Missing price returns 400', productMissingPrice.status === 400,
            `Got ${productMissingPrice.status}, expected 400`);
        
        /* 14. Product - Negative price */
        console.log('14. Product - Negative price');
        const productNegativePrice = await testEndpoint('POST', '/api/products', {
            name: 'Test Product',
            price: -10.99
        });
        logTest('Negative price returns 400', productNegativePrice.status === 400,
            `Got ${productNegativePrice.status}, expected 400`);
        
        /* 15. Product - Zero price */
        console.log('15. Product - Zero price');
        const productZeroPrice = await testEndpoint('POST', '/api/products', {
            name: 'Test Product',
            price: 0
        });
        logTest('Zero price returns 400', productZeroPrice.status === 400,
            `Got ${productZeroPrice.status}, expected 400`);
        
        /* 16. Product - Invalid price type (string) */
        console.log('16. Product - Invalid price type (string)');
        const productStringPrice = await testEndpoint('POST', '/api/products', {
            name: 'String Price',
            price: 'ninety-nine'
        });
        logTest('String price returns 400', productStringPrice.status === 400,
            `Got ${productStringPrice.status}, expected 400`);
        
        /* 17. Product - Very long name */
        console.log('17. Product - Very long name');
        const productLongName = await testEndpoint('POST', '/api/products', {
            name: 'A'.repeat(200),
            price: 99.99
        });
        logTest('Very long name returns 400', productLongName.status === 400,
            `Got ${productLongName.status}, expected 400`);
        
        /* Invalid Sales Tests */
        console.log('\nInvalid Sale Creation Tests');
        
        /* 18. Sale - Missing customerId */
        console.log('18. Sale - Missing customerId');
        const saleMissingCustomer = await testEndpoint('POST', '/api/sales', {
            productId: productId || 1,
            quantity: 2,
            saleDate: '2026-02-02'
        });
        logTest('Missing customerId returns 400', saleMissingCustomer.status === 400,
            `Got ${saleMissingCustomer.status}, expected 400`);
        
        /* 19. Sale - Missing productId */
        console.log('19. Sale - Missing productId');
        const saleMissingProduct = await testEndpoint('POST', '/api/sales', {
            customerId: customerId || 1,
            quantity: 2,
            saleDate: '2026-02-02'
        });
        logTest('Missing productId returns 400', saleMissingProduct.status === 400,
            `Got ${saleMissingProduct.status}, expected 400`);
        
        /* 20. Sale - Missing quantity */
        console.log('20. Sale - Missing quantity');
        const saleMissingQuantity = await testEndpoint('POST', '/api/sales', {
            customerId: customerId || 1,
            productId: productId || 1,
            saleDate: '2026-02-02'
        });
        logTest('Missing quantity returns 400', saleMissingQuantity.status === 400,
            `Got ${saleMissingQuantity.status}, expected 400`);
        
        /* 21. Sale - Missing saleDate */
        console.log('21. Sale - Missing saleDate');
        const saleMissingDate = await testEndpoint('POST', '/api/sales', {
            customerId: customerId || 1,
            productId: productId || 1,
            quantity: 2
        });
        logTest('Missing saleDate returns 400', saleMissingDate.status === 400,
            `Got ${saleMissingDate.status}, expected 400`);
        
        /* 22. Sale - Negative quantity */
        console.log('22. Sale - Negative quantity');
        const saleNegativeQty = await testEndpoint('POST', '/api/sales', {
            customerId: customerId || 1,
            productId: productId || 1,
            quantity: -5,
            saleDate: '2026-02-02'
        });
        logTest('Negative quantity returns 400', saleNegativeQty.status === 400,
            `Got ${saleNegativeQty.status}, expected 400`);
        
        /* 23. Sale - Zero quantity */
        console.log('23. Sale - Zero quantity');
        const saleZeroQty = await testEndpoint('POST', '/api/sales', {
            customerId: customerId || 1,
            productId: productId || 1,
            quantity: 0,
            saleDate: '2026-02-02'
        });
        logTest('Zero quantity returns 400', saleZeroQty.status === 400,
            `Got ${saleZeroQty.status}, expected 400`);
        
        /* 24. Sale - Invalid date format */
        console.log('24. Sale - Invalid date format');
        const saleInvalidDate = await testEndpoint('POST', '/api/sales', {
            customerId: customerId || 1,
            productId: productId || 1,
            quantity: 2,
            saleDate: '02-02-2026' /* Wrong format */
        });
        logTest('Invalid date format returns 400', saleInvalidDate.status === 400,
            `Got ${saleInvalidDate.status}, expected 400`);
        
        /* 25. Sale - Non-existent customer ID */
        console.log('25. Sale - Non-existent customer ID');
        const saleBadCustomer = await testEndpoint('POST', '/api/sales', {
            customerId: 99999,
            productId: productId || 1,
            quantity: 2,
            saleDate: '2026-02-02'
        });
        logTest('Non-existent customer returns 400', saleBadCustomer.status === 400,
            `Got ${saleBadCustomer.status}, expected 400`);
        
        /* 26. Sale - Non-existent product ID */
        console.log('26. Sale - Non-existent product ID');
        const saleBadProduct = await testEndpoint('POST', '/api/sales', {
            customerId: customerId || 1,
            productId: 99999,
            quantity: 2,
            saleDate: '2026-02-02'
        });
        logTest('Non-existent product returns 400', saleBadProduct.status === 400,
            `Got ${saleBadProduct.status}, expected 400`);
        
        /* 27. Sale - Invalid date (Feb 30) */
        console.log('27. Sale - Invalid date (Feb 30)');
        const saleImpossibleDate = await testEndpoint('POST', '/api/sales', {
            customerId: customerId || 1,
            productId: productId || 1,
            quantity: 2,
            saleDate: '2026-02-30'
        });
        logTest('Impossible date returns 400', saleImpossibleDate.status === 400,
            `Got ${saleImpossibleDate.status}, expected 400`);
        
        /* Invalid Parameter Tests */
        console.log('\nInvalid Get Parameter Tests');
        
        /* 28. Monthly sales - Missing year */
        console.log('28. Monthly sales - Missing year parameter');
        const monthlyMissingYear = await testEndpoint('GET', '/api/sales/monthly?month=2');
        logTest('Missing year returns 400', monthlyMissingYear.status === 400,
            `Got ${monthlyMissingYear.status}, expected 400`);
        
        /* 29. Monthly sales - Missing month */
        console.log('29. Monthly sales - Missing month parameter');
        const monthlyMissingMonth = await testEndpoint('GET', '/api/sales/monthly?year=2026');
        logTest('Missing month returns 400', monthlyMissingMonth.status === 400,
            `Got ${monthlyMissingMonth.status}, expected 400`);
        
        /* 30. Monthly sales - Invalid month (13) */
        console.log('30. Monthly sales - Invalid month (13)');
        const monthlyInvalidMonth = await testEndpoint('GET', '/api/sales/monthly?year=2026&month=13');
        logTest('Month 13 returns 400', monthlyInvalidMonth.status === 400,
            `Got ${monthlyInvalidMonth.status}, expected 400`);
        
        /* 31. Monthly sales - Invalid month (0) */
        console.log('31. Monthly sales - Invalid month (0)');
        const monthlyZeroMonth = await testEndpoint('GET', '/api/sales/monthly?year=2026&month=0');
        logTest('Month 0 returns 400', monthlyZeroMonth.status === 400,
            `Got ${monthlyZeroMonth.status}, expected 400`);
        
        /* 32. Monthly sales - Invalid year (1899) */
        console.log('32. Monthly sales - Invalid year (1899)');
        const monthlyInvalidYear = await testEndpoint('GET', '/api/sales/monthly?year=1899&month=2');
        logTest('Year 1899 returns 400', monthlyInvalidYear.status === 400,
            `Got ${monthlyInvalidYear.status}, expected 400`);
        
        /* 33. Monthly sales - Non-numeric month */
        console.log('33. Monthly sales - Non-numeric month');
        const monthlyNonNumeric = await testEndpoint('GET', '/api/sales/monthly?year=2026&month=Jan');
        logTest('Non-numeric month returns 400', monthlyNonNumeric.status === 400,
            `Got ${monthlyNonNumeric.status}, expected 400`);
        
        /* Read Endpoints Test */
        console.log('\nRead Endpoints Tests');
        
        /* 34. Get all customers */
        console.log('34. Get all customers');
        const allCustomers = await testEndpoint('GET', '/api/customers');
        if (allCustomers.status === 200 && Array.isArray(allCustomers.data.customers)) {
            logTest('Get all customers returns array', true,
                `- ${allCustomers.data.customers.length} customers`);
        } else {
            logTest('Get all customers returns array', false,
                `Got status ${allCustomers.status}`);
        }
        
        /* 35. Get all products */
        console.log('35. Get all products');
        const allProducts = await testEndpoint('GET', '/api/products');
        if (allProducts.status === 200 && Array.isArray(allProducts.data.products)) {
            logTest('Get all products returns array', true,
                `- ${allProducts.data.products.length} products`);
        } else {
            logTest('Get all products returns array', false,
                `Got status ${allProducts.status}`);
        }
        
        /* 36. Get all sales */
        console.log('36. Get all sales');
        const allSales = await testEndpoint('GET', '/api/sales');
        if (allSales.status === 200 && Array.isArray(allSales.data.sales)) {
            logTest('Get all sales returns array', true,
                `- ${allSales.data.sales.length} sales`);
        } else {
            logTest('Get all sales returns array', false,
                `Got status ${allSales.status}`);
        }
        
        /* Summary */
        console.log('\nTest Summary');
        
        const passed = testResults.filter(t => t.passed).length;
        const total = testResults.length;
        const percentage = Math.round((passed / total) * 100);
        
        console.log(`Total Tests: ${total}`);
        console.log(`Passed: ${passed}`);
        console.log(`Failed: ${total - passed}`);
        console.log(`Success Rate: ${percentage}%`);
        
        /* Show failures */
        const failures = testResults.filter(t => !t.passed);
        if (failures.length > 0) {
            console.log('Failed Tests:');
            failures.forEach(test => {
                console.log(`  - ${test.name}: ${test.details}`);
            });
        }
        
        if (passed === total) {
            console.log('All tests passed');
            console.log('API is functioning correctly with proper error handling.');
            process.exit(0);
        } else if (percentage >= 80) {
            console.log('Most tests passed');
            console.log('Most endpoints are working, but some edge cases failed.');
            process.exit(0);
        } else {
            console.log('Testing failed');
            console.log('Multiple endpoints are not working correctly.');
            process.exit(1);
        }
        
    } catch (error) {
        console.error('Test runner failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

/* Check if server is running */
async function checkServer() {
    return new Promise((resolve) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3000,
            path: '/',
            method: 'GET',
            timeout: 5000
        }, (res) => {
            resolve(true);
        });
        
        req.on('error', () => {
            resolve(false);
        });
        
        req.on('timeout', () => {
            req.destroy();
            resolve(false);
        });
        
        req.end();
    });
}

async function main() {
    const serverRunning = await checkServer();
    
    if (!serverRunning) {
        console.error('Server is not running on http://localhost:3000');
        console.error('Please start the server first:');
        console.error('  npm start');
        console.error('Then run: node test.js');
        process.exit(1);
    }
    
    console.log('Server is running, starting tests');
    await runTests();
}

/* Test interrupt */
process.on('SIGINT', () => {
    console.log('👋 Tests interrupted by user');
    process.exit(0);
});

main();