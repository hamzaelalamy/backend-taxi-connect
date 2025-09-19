// src/core/swagger.ts
import swaggerJSDoc from "swagger-jsdoc";
import config from "./config";

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Taxi-Connect API",
      version: "1.0.0",
      description:
        "API documentation for Taxi-Connect - Taxi rides Platform for Morocco",
      contact: {
        name: "API Support",
        url: "https://taxi-connect.com/support",
        email: "support@taxi-connect.com",
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: "Development server",
      },
      {
        url: "https://api.taxi-connect.com",
        description: "Production server",
      },
    ],
  },
  // Path to the API docs - note the addition of the docs directory
  apis: [
    "./src/services/**/routes.ts",
    "./src/services/**/models/*.ts",
    "./src/services/**/docs/*.swagger.js",
    "./src/models/*.ts",
  ],
};

// Generate the swagger spec
let swaggerSpec: any;

// Handle errors in case the files don't exist yet
try {
  swaggerSpec = swaggerJSDoc(swaggerOptions);
} catch (error) {
  console.warn("Warning: Could not generate Swagger documentation:", error);
  // Provide a minimal fallback for swagger to not crash the app
  swaggerSpec = {
    openapi: "3.0.0",
    info: {
      title: "Taxi-Connect API",
      version: "1.0.0",
      description: "API documentation not fully generated yet",
    },
    paths: {},
  };
}

export default swaggerSpec;
