import Customer from '../models/customer.js';
import xray from 'aws-xray-sdk';
const { getSegment } = xray;

const customers = [
    new Customer(1, "Northwind Traders", "Bangalore", 12000, true, "Simple Remarks for Customer 11"),
    new Customer(2, "Eastwind Traders", "Bangalore", 12000, true, "Simple Remarks for Customer 12"),
    new Customer(3, "Southwind Traders", "Bangalore", 12000, true, "Simple Remarks for Customer 13"),
    new Customer(4, "Westwind Traders", "Bangalore", 12000, true, "Simple Remarks for Customer 14"),
    new Customer(5, "Oxyrich Traders", "Bangalore", 12000, true, "Simple Remarks for Customer 51"),
    new Customer(6, "Adventureworks", "Bangalore", 12000, true, "Simple Remarks for Customer 15"),
    new Customer(7, "Nuts and Bolts Inc.", "Bangalore", 12000, true, "Simple Remarks for Customer 16"),
    new Customer(8, "Tailwind Services", "Bangalore", 12000, true, "Simple Remarks for Customer 17"),
    new Customer(9, "ModX Mobil Services", "Bangalore", 12000, true, "Simple Remarks for Customer 18"),
    new Customer(10, "Oilrich Countryman", "Bangalore", 12000, true, "Simple Remarks for Customer 19")
];

class CustomerService {
    getCustomers() {
        const promise = new Promise((resolve, reject) => {
            const segment = getSegment();

            segment.addAnnotation("routeUrl", "/");
            segment.addAnnotation("operation", "getCustomers");

            resolve(customers);
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
            const filteredCustomers = customers.filter(
                customer => customer.id === id);

            if (filteredCustomers && filteredCustomers.length >= 1) {
                segment.addMetadata("operationStatus", "Success");

                resolve(filteredCustomers[0]);
            } else {
                const errorMessage = "Customer Record Not Found!"

                segment.addMetadata("operationStatus", "Failed");
                segment.addError(errorMessage);

                reject(errorMessage);
            }
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
            customers.push(customer);

            segment.addMetadata("operationStatus", "Success");

            resolve(true);
        });

        return promise;
    }
}

export default CustomerService;
