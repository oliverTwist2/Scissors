const swaggerAutogen = require('swagger-autogen')();
const dotenv = require("dotenv");


dotenv.config();


  console.log(process.env.BASE_URL);

  const doc = {
    info: {
        title: "URL Shortener API",
        description: "API for URL Shortener",
    },
    host: process.env.BASE_URL,
    schemes: ['http', 'https'],
  }


    const outputFile = './swagger_output.json';
    const endpointsFiles = ['./index.js', './url.js'];




    swaggerAutogen(outputFile, endpointsFiles, doc);