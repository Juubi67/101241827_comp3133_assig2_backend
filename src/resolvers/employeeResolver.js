const Employee = require("../models/employee");

const employeeResolver = {
  Query: {
    getAllEmployees: async () => {
      const employees = await Employee.find();
      return employees;
    },
    searchEmployeeById: async (_, { eid }) => {
      const employee = await Employee.findById(eid);
      return employee;
    },
  },
  Mutation: {
    addNewEmployee: async (_, { input }) => {
      // Add validation logic for input data
      const newEmployee = new Employee(input);
      await newEmployee.save();
      return newEmployee;
    },
    updateEmployeeById: async (_, { eid, input }) => {
      // Add validation logic for input data
      const updatedEmployee = await Employee.findByIdAndUpdate(eid, input, {
        new: true,
      });
      return updatedEmployee;
    },
    deleteEmployeeById: async (_, { eid }) => {
      const deletedEmployee = await Employee.findByIdAndDelete(eid);
      return deletedEmployee;
    },
  },
};

module.exports = employeeResolver;
