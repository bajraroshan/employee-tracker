//DEPENDENCIES
const inquirer = require("inquirer");
const connection = require("./config/connection");
const cTable = require("console.table");

const departments = require("./lib/departments");
const roles = require("./lib/roles");
const employees = require("./lib/employees");

const init = async () => {
  await inquirer
    .prompt([
      {
        type: "list",
        name: "input",
        message: "What would you like to do?",
        choices: [
          "View all departments",
          "View all roles",
          "View all employees",
          "Add a department",
          "Add a role",
          "Add an employee",
          "Update an employee role",
          "Quit",
        ],
      },
    ])
    .then((data) => {
    //   console.log("You entered " + data.input);

      if (data.input === "View all departments") {
        console.log("View all department");
        departments.viewDepartment();
        init();
      } else if (data.input === "View all roles") {
        console.log("View all roles");
        roles.viewRole();
        init();
      } else if (data.input === "View all employees") {
        console.log("View all employees");
        employees.viewEmployees();
        init();
      } else if (data.input === "Add a department") {
        const order = async () => {
          console.log("Add a department");
          await departments.addDepartment();
          await init();
        };
        order();
      } else if (data.input === "Add a role") {
        const order = async () => {
          console.log("Add a role");
          await roles.addRole();
          await init();
        };
        order();
      } else if (data.input === "Add an employee") {
        const order = async () => {
          console.log("Add an employee");
          await employees.addEmployee();
          await init();
        };
        order();
      } else if (data.input === "Quit") {
        return;
      }
    })
    .catch((error) => {
      console.log(error);
    });
};

init();
