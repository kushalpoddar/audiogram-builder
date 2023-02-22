const AWS = require("aws-sdk");
const dynamodb = require('aws-sdk/clients/dynamodb')

const region = "us-east-1";
const endpoint = process.env.DDB_ENDPOINT;

const DynamoDB = new AWS.DynamoDB({
    endpoint: endpoint,
    region: region
});

const DocumentClient = new dynamodb.DocumentClient({
    endpoint: endpoint,
    region: region,
    convertEmptyValues: false
})

module.exports = {
    DynamoDB: DynamoDB,
    DocumentClient: DocumentClient
};
