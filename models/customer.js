class Customer {
    constructor(id, name, address, credit, status, remarks) {
        [this.id, this.name, this.address, this.credit, this.status, this.remarks] = arguments;
    }

    toString() {
        return `${this.id}, ${this.name}, ${this.address}, ${this.credit}, ${this.status}, ${this.remarks}`;
    }
}

export default Customer;
