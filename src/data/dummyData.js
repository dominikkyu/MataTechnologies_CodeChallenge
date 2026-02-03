/* Dummy Sales Data */

const customers = [
    {
        id: 1,
        name: 'customer1',
        email: 'customer1@test.com'
    },
    {
        id: 2,
        name: 'customer2',
        email: 'customer2@test.com'
    },
    {
        id: 3,
        name: 'customer3',
        email: 'customer3@test.com'
    },
    {
        id: 4,
        name: 'customer4',
        email: 'customer1@test.com'
    },
    {
        id: 5,
        name: 'customer5',
        email: 'customer5@test.com'
    }
]

const products = [
    {
        id: 1,
        name: 'product1',
        price: 100,
        category: 'categoryOdd'
    },
    {
        id: 2,
        name: 'product2',
        price: 200,
        category: 'categoryEven'
    },
    {
        id: 3,
        name: 'product3',
        price: 300,
        category: 'categoryOdd'
    },
    {
        id: 4,
        name: 'product4',
        price: 400,
        category: 'categoryEven'
    },
    {
        id: 5,
        name: 'product5',
        price: 500,
        category: 'categoryOdd'
    }
]

const sales = [
    {
        id: 1,
        customerId: 1,
        productId: 1,
        quantity: 1,
        totalAmount: 100,
        saleDate: '2026-01-01'
    },
    {
        id: 2,
        customerId: 2,
        productId: 2,
        quantity: 2,
        totalAmount: 200,
        saleDate: '2026-01-02'
    },
    {
        id: 3,
        customerId: 1,
        productId: 2,
        quantity: 3,
        totalAmount: 300,
        saleDate: '2026-01-02'
    },
    {
        id: 4,
        customerId: 2,
        productId: 1,
        quantity: 1,
        totalAmount: 400,
        saleDate: '2026-02-01'
    },
    {
        id: 5,
        customerId: 3,
        productId: 3,
        quantity: 3,
        totalAmount: 200,
        saleDate: '2026-02-02'
    }
]

module.exports = {
    customers,
    products,
    sales
};