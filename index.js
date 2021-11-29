//DEPENDENCIES
const inquirer = require("inquirer");
const { printTable } = require("console-table-printer");
const db = require("./config/connection");
var figlet = require("figlet");


figlet("Employee \n Management \n System", function (err, data) {
  if (err) {
    console.log("Something went wrong...");
    console.dir(err);
    return;
  }
  console.log(data);
  userPrompt();
});

const confirmation = () => {
  inquirer
    .prompt([
      {
        type: "list",
        name: "again",
        message: `Would you like to continue?`,
        choices: [`Yes`, `No`],
      },
    ])
    .then(({ again }) => {
      if (again === `Yes`) {
        console.clear();
        userPrompt();
      } else {
        exit();
      }
    });
};

const userPrompt = () => {
  inquirer
    .prompt([
      {
        type: "list",
        name: "userSelect",
        message: `What would you like to do?`,
        choices: [
          "View All Department",
          "View All Role",
          "View All Employees",
          "Add a Department",
          "Add a Role",
          "Add an Employee",
          "Update an Employee Role",
          "Update Employee Manager",
          "View All Employees By Manager",
          "View All Employees By Department",
          "Delete Department",
          "Delete Role",
          "Delete Employee",
          "View Total Utilized Budget By Department",
          "EXIT",
        ],
      },
    ])
    .then(({ userSelect }) => {
      if (userSelect === "View All Department") {
        viewDepartment();
      }
      if (userSelect === "View All Role") {
        viewRole();
      }
      if (userSelect === "View All Employees") {
        viewEmployees();
      }
      if (userSelect === "Add a Department") {
        addDepartment();
      }
      if (userSelect === "Add a Role") {
        addRole();
      }
      if (userSelect === "Add an Employee") {
        addEmployee();
      }
      if (userSelect === "Update an Employee Role") {
        updateEmployee();
      }
      if (userSelect === "Update Employee Manager") {
        updateEmployeeManager();
      }
      if (userSelect === "View All Employees By Manager") {
        viewEmployeeByManager();
      }
      if (userSelect === "View All Employees By Department") {
        viewEmployeebyDepartment();
      }
      if (userSelect === "Delete Department") {
        deleteDepartment();
      }
      if (userSelect === "Delete Role") {
        deleteRole();
      }
      if (userSelect === "Delete Employee") {
        deleteEmployee();
      }
      if (userSelect === "View Total Utilized Budget By Department") {
        viewBudget();
      }
      if (userSelect === "EXIT") {
        exit();
      }
    });
};

viewEmployees = () =>
  db
    .promise()
    .query(
      `SELECT employee.id AS ID,
  CONCAT (employee.first_name, " ", employee.last_name) AS Employee,
  role.title AS Title,
  department.name AS Department ,
  role.salary AS Salary,
  CONCAT (manager.first_name, " ", manager.last_name) AS Manager FROM employee
  LEFT JOIN role ON employee.role_id = role.id
  LEFT JOIN department ON role.department_id = department.id
  LEFT JOIN employee manager ON employee.manager_id = manager.id;`
    )
    .then(([rows, fields]) => {
      printTable(rows);
      confirmation();
    });

addEmployee = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "firstName",
        message: `Enter first name: `,
        validate: (checkFirst) => {
          if (checkFirst) {
            return true;
          } else {
            console.log("Please enter a first name");
            return false;
          }
        },
      },
      {
        type: "input",
        name: "lastName",
        message: `Enter last name: `,
        validate: (checkLast) => {
          if (checkLast) {
            return true;
          } else {
            console.log("Please enter a last name");
            return false;
          }
        },
      },
    ])
    .then((answer) => {
      const employee = [answer.firstName, answer.lastName];

      db.promise()
        .query(`SELECT role.id, role.title FROM role`)
        .then(([rows, fields]) => {
          const role = rows.map(({ id, title }) => ({
            name: title,
            value: id,
          }));
          inquirer
            .prompt([
              {
                type: "list",
                name: "role",
                message: `What is the employee's role?`,
                choices: role,
              },
            ])
            .then((answer) => {
              employee.push(answer.role);
              db.promise()
                .query(`SELECT * FROM employee`)
                .then(([rows, fields]) => {
                  const managers = rows.map(
                    ({ id, first_name, last_name }) => ({
                      name: first_name + " " + last_name,
                      value: id,
                    })
                  );
                  inquirer
                    .prompt([
                      {
                        type: "list",
                        name: "manager",
                        message: `Who is the employee's manager?`,
                        choices: managers,
                      },
                    ])
                    .then((answer) => {
                      employee.push(answer.manager);
                      console.log("Employee has been added!");
                      confirmation();
                      db.query(
                        `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                    VALUES (?, ?, ? ,?)`,
                        employee,
                        (err, result) => {
                          if (err) {
                            throw err;
                          }
                        }
                      );
                    });
                });
            });
        });
    });
};

updateEmployee = () => {
  db.query(`SELECT * FROM employee`, (err, data) => {
    if (err) throw err;

    const employees = data.map(({ id, first_name, last_name }) => ({
      name: first_name + " " + last_name,
      value: id,
    }));

    inquirer
      .prompt([
        {
          type: "list",
          name: "name",
          message: "Which employee would you like to update?",
          choices: employees,
        },
      ])
      .then((answer) => {
        db.query(`SELECT * FROM role`, (err, data) => {
          if (err) throw err;
          const employee = answer.name;
          const role = data.map(({ id, title }) => ({
            name: title,
            value: id,
          }));
          inquirer
            .prompt([
              {
                type: "list",
                name: "role",
                message: `What is the employee's new role?`,
                choices: role,
              },
            ])
            .then((answer) => {
              const role = answer.role;
              const arr = [role, employee];
              db.query(
                `UPDATE employee SET role_id = ? WHERE id = ?`,
                arr,
                (err, result) => {
                  if (err) throw err;
                  console.log("Employee has been updated!");
                  confirmation();
                }
              );
            });
        });
      });
  });
};

deleteEmployee = () => {
  db.query(`SELECT * FROM employee`, (err, data) => {
    if (err) throw err;

    const employees = data.map(({ id, first_name, last_name }) => ({
      name: first_name + " " + last_name,
      value: id,
    }));

    inquirer
      .prompt([
        {
          type: "list",
          name: "name",
          message: "Which employee would you like to delete?",
          choices: employees,
        },
      ])
      .then((answer) => {
        const employee = answer.name;

        db.query(
          `DELETE FROM employee WHERE id = ?`,
          employee,
          (err, result) => {
            if (err) throw err;
            console.log("Successfully Deleted!");

            confirmation();
          }
        );
      });
  });
};

viewEmployeebyDepartment = () =>
  db
    .promise()
    .query(
      `SELECT department.name AS Department,
  CONCAT (employee.first_name, " ", employee.last_name) as Employee
  FROM employee 
  LEFT JOIN role ON employee.role_id = role.id 
  LEFT JOIN department ON role.department_id = department.id;`
    )
    .then(([rows, fields]) => {
      printTable(rows);
      confirmation();
    });

viewEmployeeByManager = () =>
  db
    .promise()
    .query(
      `SELECT CONCAT (manager.first_name, " ", manager.last_name) AS Manager,
  CONCAT (employee.first_name, " ", employee.last_name) as Employee,
  department.name AS department
  FROM employee 
  LEFT JOIN role ON employee.role_id = role.id 
  LEFT JOIN department ON role.department_id = department.id
  LEFT JOIN employee manager ON employee.manager_id = manager.id;`
    )
    .then(([rows, fields]) => {
      printTable(rows);
      confirmation();
    });

updateEmployeeManager = () => {
  db.query(`SELECT * FROM employee`, (err, data) => {
    if (err) throw err;

    const employees = data.map(({ id, first_name, last_name }) => ({
      name: first_name + " " + last_name,
      value: id,
    }));

    inquirer
      .prompt([
        {
          type: "list",
          name: "name",
          message: "Which employee would you like to update?",
          choices: employees,
        },
      ])
      .then((answer) => {
        const arr = [];
        const employee = answer.name;
        arr.push(employee);
        const managers = data.map(({ id, first_name, last_name }) => ({
          name: first_name + " " + last_name,
          value: id,
        }));
        inquirer
          .prompt([
            {
              type: "list",
              name: "manager",
              message: `Who is the employee's new manager?`,
              choices: managers,
            },
          ])
          .then((answer) => {
            const manager = answer.manager;
            arr.unshift(manager);
            db.query(
              `UPDATE employee SET manager_id = ? WHERE id = ?`,
              arr,
              (err, result) => {
                if (err) throw err;
                console.log("Employee has been updated!");
                confirmation();
              }
            );
          });
      });
  });
};

viewBudget = () => {
  db.query(
    `SELECT department.name AS Department,
  SUM(role.salary) as Budget
  FROM department
  LEFT JOIN role ON department_id = department.id
  GROUP BY department.id;`,
    (err, data) => {
      if (err) throw err;
      printTable(data);
      confirmation();
    }
  );
};

viewDepartment = () => {
  db.query(
    `SELECT department.name AS Department FROM department`,
    (err, data) => {
      if (err) throw err;
      printTable(data);
      confirmation();
    }
  );
};

addDepartment = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "department",
        message: `Enter new department: `,
      },
    ])
    .then((answer) => {
      db.query(
        `INSERT INTO department (name) VALUES (?)`,
        answer.department,
        (err, result) => {
          if (err) throw err;
          console.log("Department has been added!");
          confirmation();
        }
      );
    });
};

deleteDepartment = () => {
  db.query(`SELECT * FROM department`, (err, data) => {
    if (err) throw err;

    const department = data.map(({ id, name }) => ({ name: name, value: id }));

    inquirer
      .prompt([
        {
          type: "list",
          name: "name",
          message: "Which department would you like to delete?",
          choices: department,
        },
      ])
      .then((answer) => {
        db.query(
          `DELETE FROM department WHERE id = ?`,
          answer.name,
          (err, result) => {
            if (err) throw err;
            console.log("Successfully Deleted!");

            confirmation();
          }
        );
      });
  });
};

viewRole = () => {
  db.query(
    `SELECT role.title AS Title,
      role.salary AS Salary,
      department.name AS Department
      FROM role LEFT JOIN department ON role.department_id = department.id;`,
    (err, data) => {
      if (err) throw err;
      printTable(data);
      confirmation();
    }
  );
};

addRole = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "role",
        message: `Enter new role: `,
      },
    ])
    .then((answer) => {
      let arr = [answer.role];

      db.query(`SELECT * FROM department`, (err, data) => {
        if (err) throw err;

        const departments = data.map(({ name, id }) => ({
          name: name,
          value: id,
        }));

        inquirer
          .prompt([
            {
              type: "list",
              name: "name",
              message: "Which department is this role in?",
              choices: departments,
            },
          ])
          .then((answer) => {
            arr.push(answer.name);

            inquirer
              .prompt([
                {
                  type: "input",
                  name: "salary",
                  message: "What is the salary for this role?",
                },
              ])
              .then((answer) => {
                arr.push(answer.salary);
                db.query(
                  `INSERT INTO role (title, department_id, salary) VALUES (?, ?, ?)`,
                  arr,
                  (err, result) => {
                    if (err) throw err;
                    console.log("Role has been added!");
                    confirmation();
                  }
                );
              });
          });
      });
    });
};

deleteRole = () => {
  db.query(`SELECT * FROM role`, (err, data) => {
    if (err) throw err;

    const role = data.map(({ id, title }) => ({ name: title, value: id }));

    inquirer
      .prompt([
        {
          type: "list",
          name: "name",
          message: "Which role would you like to delete?",
          choices: role,
        },
      ])
      .then((answer) => {
        db.query(
          `DELETE FROM role WHERE id = ?`,
          answer.name,
          (err, result) => {
            if (err) throw err;
            console.log("Successfully Deleted!");

            confirmation();
          }
        );
      });
  });
};

exit = () => {
  process.exit();
};
