import CustomerServiceHost from './hosting/customer-service-host.js';

class Main {
    static run() {
        const portNumber = process.env.SERVICE_PORT;
        const customerServiceHost = new CustomerServiceHost(portNumber);

        customerServiceHost
            .startServer()
            .then(() => console.log("Customer Service Started Successfully!"));

        const stopServer = () => {
            customerServiceHost
                .stopServer()
                .then(() => console.log("Customer Service Stopped Successfully!"));
        };

        process.on('exit', stopServer);
        process.on('SIGINT', stopServer);
    }
}

Main.run();
