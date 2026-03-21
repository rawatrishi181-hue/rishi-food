const swaggerJsDoc = require('swagger-jsdoc');
const path = require('path');

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Rishi Food Ordering API',
            version: '1.0.0',
            description: 'API Documentation for the Food Ordering App (Zomato-style)',
            contact: {
                name: 'Developer'
            },
            servers: [
                {
                    url: `http://localhost:${process.env.PORT || 5000}`,
                    description: 'Local server (localhost)'
                },
                {
                    url: `http://127.0.0.1:${process.env.PORT || 5000}`,
                    description: 'Local server (IP)'
                }
            ]
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [{
            bearerAuth: []
        }]
    },
    apis: [path.join(__dirname, '../routes/*.js')] // Use absolute path for reliability
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = swaggerDocs;
