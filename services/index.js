const DepartmentsService = require('./departments.service');
const EmployeesService = require('./employees.service');
const UsersService = require('./users.service');

const services = {};

services.departments = DepartmentsService;
services.employees = EmployeesService;
services.users = UsersService;

module.exports = services;
