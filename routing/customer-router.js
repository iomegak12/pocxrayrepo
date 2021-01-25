import express from 'express';
import CustomerDbService from '../services/customer-service-dynamodb.js';
import Customer from '../models/customer.js';

import xray from 'aws-xray-sdk';
import aws from 'aws-sdk';

class CustomerRouter {
    constructor() {
        this.router = express.Router();
        this.customerService = new CustomerDbService();
        this.initializeRouting();
        this.sqs = xray.captureAWSClient(new aws.SQS());
        this.queueUrl = process.env.CUSTOMER_QUEUE_URL;
    }

    initializeRouting() {
        this.router.get('/', async (request, response) => {
            try {
                const customers = await this.customerService.getCustomers();

                response
                    .status(200)
                    .send(customers);
            } catch (error) {
                response
                    .status(500)
                    .send({
                        errorMessage: JSON.stringify(error)
                    });
            }
        });

        this.router.get('/:id', async (request, response) => {
            try {
                const id = parseInt(request.params.id);

                if (!id) {
                    response
                        .status(400)
                        .send({
                            errorMessage: 'Invalid Customer Id Specified!'
                        });
                } else {
                    const filteredCustomer = await this.customerService.getCustomerById(id);

                    if (filteredCustomer) {
                        response
                            .status(200)
                            .send(filteredCustomer);
                    }
                    else {
                        response
                            .status(400)
                            .send({
                                errorMessage: 'Customer Record Not Found!'
                            });
                    }
                }
            } catch (error) {
                response
                    .status(500)
                    .send({
                        errorMessage: JSON.stringify(error)
                    });
            }
        });

        this.router.post('/', async (request, response) => {
            try {
                const body = request.body;
                const customer = new Customer(
                    body.id, body.name, body.address,
                    body.credit, body.status, body.remarks);

                const status = await this.customerService.addCustomer(customer);

                if (status) {
                    const params = {
                        MessageAttributes: {
                            "customerId": {
                                DataType: "String",
                                StringValue: customer.id.toString()
                            }
                        },
                        MessageBody: JSON.stringify(customer),
                        QueueUrl: this.queueUrl
                    };

                    this.sqs.sendMessage(params, (error, result) => {
                        if (error) {
                            console.log(`SQS Error : ${error}`);
                        } else {
                            console.log(`SQL Success ... ${result.MessageId}`);
                        }
                    });

                    response
                        .status(200)
                        .send(status);
                } else {
                    response
                        .status(500)
                        .send("Unable to process the customer record!")
                }
            } catch (error) {
                response
                    .status(500)
                    .send({
                        errorMessage: JSON.stringify(error)
                    });
            }
        });
    }


    get Router() {
        return this.router;
    }
}

export default CustomerRouter;
