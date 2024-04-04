const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userResolver = require("./resolvers/userResolver");
const employeeResolver = require("./resolvers/employeeResolver");

dotenv.config();

const app = express();

const startServer = async () => {
  const server = new ApolloServer({
    typeDefs: `
      type User {
        _id:String
        username: String!
        email: String!
        password: String!
        token:String
      }
      
      type Employee {
        first_name: String!
        last_name: String!
        email: String!
        gender: String
        salary: Float!
      }

      input UserInput {
        username: String!
        email: String!
        password: String!
      }

      input EmployeeInput {
        first_name: String!
        last_name: String!
        email: String!
        gender: String
        salary: Float!
      }

      type Query {
        login(username: String!, password: String!): User
        getAllEmployees: [Employee]
        searchEmployeeById(eid: ID!): Employee
      }

      type Mutation {
        signup(input: UserInput!): User
        addNewEmployee(input: EmployeeInput!): Employee
        updateEmployeeById(eid: ID!, input: EmployeeInput!): Employee
        deleteEmployeeById(eid: ID!): Employee
      }
    `,
    resolvers: [userResolver, employeeResolver],
  });

  // Await server.start() before applying middleware
  await server.start();

  server.applyMiddleware({ app });
};

// Connect to MongoDB and start the server
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  startServer();
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}/graphql`);
});
