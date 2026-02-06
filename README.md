# 1-Week Code Challenge!

Created by **Dominique Abellana**
For use in *Junior Backend Developer Application* by **Mata Technologies**

A RESTful API for managing sales data with customer-product relationships, using JSON file storage.

# Setup

## Prerequisites

-   Node.js (v14 or higher)
-   npm or yarn

## Dependencies
-	Fastify

## Getting started

 1. After cloning the repository, start with the installation of dependencies.
```
npm install
npm install fastify
```
2. Start the server. Server will start at: `http://localhost:3000`
```
npm start
```
## Project Structure
```
./
├── src/
│   ├── app.js                 # Main server entry point
│   ├── controllers/
│   │   └── salesController.js # Request handlers
│   ├── routes/
│   │   └── salesRoutes.js     # Route definitions & validation
│   └── data/
│       ├── databaseService.js # Database abstraction layer
│       ├── jsonDataService.js # JSON file operations
│       └── data.json          # Data storage
├── package.json
└── README.md
```
## Data Models

### Customer
```
{
	"id": 1,
	"name": "customer1",
	"email": "customer1@test.com"
}
```
### Product
```
{
	"id": 1,
	"name": "product1",
	"price": 100,
	"category": "Food"
}
```

### Sale
```
{
	"id": 1,
	"customerId": 1,
	"productId": 1,
	"quantity": 1,
	"totalAmount": 100,
	"saleDate": "2026-01-01"
}
```

## API Endpoints

- `GET /` - Root
- `GET /api/health` - Health check

#### Read Endpoints
- `GET /api/customers` - All customers data
- `GET /api/products` - All products data
- `GET /api/sales` - All sales data
- `GET /api/sales/monthly?year=YYYY&month=MM` - Monthly sales report

#### Create Endpoints

 - `POST /api/customers` - Create customer
 - `POST /api/products` - Create product
 - `POST /api/sales` - Create sale

## HTTP Status Codes
-   `200` - Success
-   `201` - Created successfully    
-   `400` - Bad request (validation errors)  
-   `404` - Resource not found 
-   `500` - Internal server error