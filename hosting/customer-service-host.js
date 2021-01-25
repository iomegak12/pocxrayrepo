import express from 'express';
import http from 'http';
import CustomerRouter from '../routing/customer-router.js';
import bodyParser from 'body-parser';
import xray from 'aws-xray-sdk';
import aws from 'aws-sdk';

class CustomerServiceHost {
    constructor(portNumber) {
        if (!portNumber) {
            throw new Error('Invalid Port Number Specified!');
        }

        this.serviceName = "XRAY-POC-Cstomers";
        this.portNumber = portNumber;
        this.customerRouter = new CustomerRouter();
        this.app = express();
        this.httpServer = http.createServer(this.app);

        this.initializeHost();
    }

    initializeHost() {
        this.app.use(xray.express.openSegment(this.serviceName));
        this.app.use(this.applyCors);
        this.app.use(bodyParser.json());
        this.app.use('/api/customers', this.customerRouter.Router);
        this.app.use(xray.express.closeSegment());
    }

    applyCors(request, response, next) {
        response.header('Access-Control-Allow-Credentials', 'true');
        response.header('Access-Control-Allow-Origin', '*');
        response.header('Access-Control-Allow-Methods', '*');
        response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

        next();
    }

    startServer() {
        const promise = new Promise((resolve, reject) => {
            this.httpServer.listen(this.portNumber, () => resolve());
        });

        return promise;
    }

    stopServer() {
        const promise = new Promise((resolve, reject) => {
            this.httpServer.close(() => resolve());
        });

        return promise;
    }
}

export default CustomerServiceHost;
