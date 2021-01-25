import Customer from '../models/customer.js';
import aws from 'aws-sdk';

import xray from 'aws-xray-sdk';
const { getSegment } = xray;

class CustomerDbService {
    constructor() {
        this.tableName = 'customers';
        this.documentClient = new aws.DynamoDB.DocumentClient({
            service: new aws.DynamoDB()
        });

        xray.captureAWSClient(this.documentClient.service);
    }

    getCustomers() {
        const promise = new Promise((resolve, reject) => {
            const segment = getSegment();

            segment.addAnnotation("routeUrl", "/");
            segment.addAnnotation("operation", "getCustomers");

            const params = {
                TableName: 'customers',
            };

            this.documentClient.scan(params, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    const { Items: customers } = result;

                    resolve(customers);
                }
            });
        });

        return promise;
    }

    getCustomerById(id) {
        const segment = getSegment();

        if (!id) {
            const error = new Error("Invalid Identifier Specified!");
            segment.addError(error);

            throw error;
        }

        segment.addAnnotation("routeUrl", "/id");
        segment.addAnnotation("operation", "getCustomerById");
        segment.addMetadata("id", id);

        const promise = new Promise((resolve, reject) => {
            const params = {
                TableName: 'customers',
                KeyConditionExpression: "customerid = :i",
                ExpressionAttributeValues: {
                    ":i": id.toString()
                }
            };

            this.documentClient.query(params, (error, result) => {
                if (error) {
                    const errorMessage = "Unable to Query the Customers Table!"

                    segment.addMetadata("operationStatus", "Failed");
                    segment.addError(errorMessage);

                    reject(error);
                } else {
                    segment.addMetadata("operationStatus", "Success");

                    const { Items: customers } = result;
                    const filteredCustomer = customers[0];

                    resolve(filteredCustomer);
                }
            });
        });

        return promise;
    }

    addCustomer(customer) {
        const segment = getSegment();

        if (!customer) {
            const error = new Error("Invalid Customer Record Specified!");

            segment.addError(error);

            throw error;
        }

        segment.addAnnotation("routeUrl", "/");
        segment.addAnnotation("operation", "addCustomer");
        segment.addMetadata("customer", JSON.stringify(customer));

        const promise = new Promise((resolve, reject) => {
            const params = {
                TableName: 'customers',
                Item: {
                    customerid: customer.id.toString(),
                    name: customer.name,
                    address: customer.address,
                    credit: customer.credit,
                    status: customer.status,
                    remarks: customer.remarks
                }
            };

            this.documentClient.put(params, (error, result) => {
                if (error) {
                    segment.addMetadata("operationStatus", "Failed");

                    reject(error);
                } else {
                    segment.addMetadata("operationStatus", "Success");

                    resolve(true);
                }
            });

        });

        return promise;
    }
}

export default CustomerDbService;
