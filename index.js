//DEPENDENCIES
const inquirer = require("inquirer");
const { printTable } = require('console-table-printer');

const figlet = require("figlet");
figlet("Employee \n Management \n System", function (err, data) {
  if (err) {
    console.log("Something went wrong...");
    console.dir(err);
    return;
  }
  console.log(data);
  init();
});

const db = require("./config/connection");

const init = () => {
  inquirer
    .prompt([
      {
        type: "list",
        name: "userSelect",
        message: `What would you like to do?`,
        choices: [
          `View All Employees`,
          `Add Employee`,
          `Remove Employee`,
          `Update Employee role`,
          `Update Employee Manager`,
          `View All Employees By Department`,
          `View All Department`,
          `Add Department`,
          `Remove Department`,
          `View All Role`,
          `Add Role`,
          `Remove Role`,
          `View All Employees By Manager`,
          `View Total Utilized Budget By Department`,
          `EXIT`,
        ],
      },
    ])
    .then(({ userSelect }) => {
      if (userSelect === `View All Employees`) {
        viewAllEmployees();
      }
      if (userSelect === `View All Employees By Department`) {
        viewEmpByDept();
      }
      if (userSelect === `View All Employees By Manager`) {
        viewEmpByMgr();
      }
      if (userSelect === `Add Employee`) {
        addEmp();
      }
      if (userSelect === `Remove Employee`) {
        removeEmp();
      }
      if (userSelect === `Update Employee role`) {
        updateEmp();
      }
      if (userSelect === `Update Employee Manager`) {
        updateEmpMgr();
      }
      if (userSelect === `Add Department`) {
        addDept();
      }
      if (userSelect === `Remove Department`) {
        removeDept();
      }
      if (userSelect === `Add Role`) {
        addRole();
      }
      if (userSelect === `Remove Role`) {
        removeRole();
      }
      if (userSelect === `View All Department`) {
        viewDept();
      }
      if (userSelect === `View All Role`) {
        viewRoles();
      }
      if (userSelect === `View Total Utilized Budget By Department`) {
        viewBudget();
      }
      if (userSelect === `EXIT`) {
        exit();
      }
    });
};

viewAllEmployees = () =>
  db
    .promise()
    .query(
      `SELECT employee.id,
 CONCAT (employee.first_name, " ", employee.last_name) AS employee,
 role.title,
 department.name AS department ,
 role.salary,
 CONCAT (manager.first_name, " ", manager.last_name) AS manager FROM employee
 LEFT JOIN role ON employee.role_id = role.id
 LEFT JOIN department ON role.department_id = department.id
 LEFT JOIN employee manager ON employee.manager_id = manager.id;`
    )
    .then(([rows, fields]) => {
      printTable(rows);
      init();
    });

viewEmpByDept = () =>
  db
    .promise()
    .query(
      `SELECT department.name AS department,
 CONCAT (employee.first_name, " ", employee.last_name) as employee
 FROM employee 
 LEFT JOIN role ON employee.role_id = role.id 
 LEFT JOIN department ON role.department_id = department.id
 ORDER by department DESC`
    )
    .then(([rows, fields]) => {
      printTable(rows);
      init();
    });

viewEmpByMgr = () =>
  db
    .promise()
    .query(
      `SELECT CONCAT (manager.first_name, " ", manager.last_name) AS manager,
 CONCAT (employee.first_name, " ", employee.last_name) as employee,
 department.name AS department
 FROM employee 
 LEFT JOIN role ON employee.role_id = role.id 
 LEFT JOIN department ON role.department_id = department.id
 LEFT JOIN employee manager ON employee.manager_id = manager.id
 ORDER by manager DESC;`
    )
    .then(([rows, fields]) => {
      printTable(rows);
      init();
    });

addEmp = () => {
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
            console.log("Please enter a first name".red);
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
            console.log("Please enter a last name".red);
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
          const roles = rows.map(({ id, title }) => ({
            name: title,
            value: id,
          }));
          inquirer
            .prompt([
              {
                type: "list",
                name: "role",
                message: `What is the employee's role?`,
                choices: roles,
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
                      init();
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

removeEmp = () => {
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

            init();
          }
        );
      });
  });
};

updateEmp = () => {
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
          const roles = data.map(({ id, title }) => ({
            name: title,
            value: id,
          }));
          inquirer
            .prompt([
              {
                type: "list",
                name: "role",
                message: `What is the employee's new role?`,
                choices: roles,
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
                  init();
                }
              );
            });
        });
      });
  });
};

updateEmpMgr = () => {
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
                init();
              }
            );
          });
      });
  });
};

addDept = () => {
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
          init();
        }
      );
    });
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
                    init();
                  }
                );
              });
          });
      });
    });
};

removeDept = () => {
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

            init();
          }
        );
      });
  });
};

removeRole = () => {
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

            init();
          }
        );
      });
  });
};

viewDept = () => {
  db.query(
    `SELECT department.name AS department FROM department`,
    (err, data) => {
      if (err) throw err;
      printTable(data);
      init();
    }
  );
};

viewRoles = () => {
  db.query(
    `SELECT role.title,
     role.salary,
     department.name AS department
     FROM role LEFT JOIN department ON role.department_id = department.id;`,
    (err, data) => {
      if (err) throw err;
      printTable(data);
      init();
    }
  );
};

viewBudget = () => {
  db.query(
    `SELECT department.name AS department,
 SUM(role.salary) as budget
 FROM department
 LEFT JOIN role ON department_id = department.id
 GROUP BY department.id;`,
    (err, data) => {
      if (err) throw err;
      printTable(data);
      init();
    }
  );
};

exit = () => {
  process.exit();
};