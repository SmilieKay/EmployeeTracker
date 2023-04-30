const inquirer = require("inquirer");
const connection = require("./connection");
const dotenv = require("dotenv");
dotenv.config();

function mainMenu() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: [
          "View all departments",
          "View all roles",
          "View all employees",
          "Add a department",
          "Add a role",
          "Add an employee",
          "Update an employee manager",
          "View employees by department",
          'View employees by manager', 
          "Update an employee role",
          "Delete an employee",
          "View department's utilized budget",
          "Exit",
        ],
      },
    ])
    .then((answer) => {
      switch (answer.action) {
        case "View all departments":
          viewDepartments();
          break;
        case "View all roles":
          viewRoles();
          break;
        case "View all employees":
          viewEmployees();
          break;
        case "Add a department":
          addDepartment();
          break;
        case "Add a role":
          addRole();
          break;
        case "Add an employee":
          addEmployee();
          break;
        case "Update an employee manager":
          updateEmployeeManager();
          break;
          case "View employees by department":
            viewEmployeesByDepartment();
            break;
        case "View employees by manager":
          viewEmployeesByManager();
          break;

        case "Update an employee role":
          updateEmployeeRole();
          break;
          
          case "Delete an employee":
            deleteEmployee();
            break;
            case "View department's utilized budget":
              viewDepartmentBudget();
              break;
        case "Exit":
          connection.end();
          break;
      }
    });
}

//  display the departments
function viewDepartments() {
  connection.query("SELECT id, name FROM departments", (err, results) => {
    if (err) {
      console.error("Error fetching departments:", err);
      mainMenu();
      return;
    }

    console.log("\nDepartments:");
    console.table(results);

    // Return to the main menu
    mainMenu();
  });
}

// database that  displays the roles with their department names
function viewRoles() {
  const query = `
      SELECT roles.id, roles.title, departments.name AS department, roles.salary
      FROM roles
      JOIN departments ON roles.department_id = departments.id
    `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching roles:", err);
      mainMenu();
      return;
    }

    console.log("\nRoles:");
    console.table(results);

    // Return to the main menu
    mainMenu();
  });
}

//  display the employees with their associated data
function viewEmployees() {
  const query = `
      SELECT e.id, e.first_name, e.last_name, roles.title AS job_title,
             departments.name AS department, roles.salary,
             CONCAT(m.first_name, ' ', m.last_name) AS manager
      FROM employees e
      LEFT JOIN roles ON e.role_id = roles.id
      LEFT JOIN departments ON roles.department_id = departments.id
      LEFT JOIN employees m ON e.manager_id = m.id
      ORDER BY e.id
    `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching employees:", err);
      mainMenu();
      return;
    }

    console.log("\nEmployees:");
    console.table(results);

    // Return to the main menu
    mainMenu();
  });
}

// Prompt for department name
function addDepartment() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "departmentName",
        message: "Enter the name of the new department:",
        validate: (input) => {
          if (input.trim() !== "") {
            return true;
          } else {
            return "Please enter a valid department name.";
          }
        },
      },
    ])
    .then((answer) => {
      // Insert the new department into the database
      connection.query(
        "INSERT INTO departments (name) VALUES (?)",
        [answer.departmentName],
        (err, result) => {
          if (err) {
            console.error("Error adding department:", err);
          } else {
            console.log(
              `\nDepartment '${answer.departmentName}' added successfully.`
            );
          }
          // Return to the main menu
          mainMenu();
        }
      );
    });
}

function getDepartments() {
  return new Promise((resolve, reject) => {
    connection.query("SELECT * FROM departments", (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

async function addRole() {
  // Get the list of departments from the database
  const departments = await getDepartments();

  // Prompt for role details
  inquirer
    .prompt([
      {
        type: "input",
        name: "roleName",
        message: "Enter the name of the new role:",
        validate: (input) => {
          if (input.trim() !== "") {
            return true;
          } else {
            return "Please enter a valid role name.";
          }
        },
      },
      {
        type: "number",
        name: "salary",
        message: "Enter the salary for the new role:",
        validate: (input) => {
          if (input > 0) {
            return true;
          } else {
            return "Please enter a positive number for the salary.";
          }
        },
      },
      {
        type: "list",
        name: "departmentId",
        message: "Select the department for the new role:",
        choices: departments.map((department) => ({
          name: department.name,
          value: department.id,
        })),
      },
    ])
    .then((answer) => {
      // Insert the new role into the database
      connection.query(
        "INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)",
        [answer.roleName, answer.salary, answer.departmentId],
        (err, result) => {
          if (err) {
            console.error("Error adding role:", err);
          } else {
            console.log(`\nRole '${answer.roleName}' added successfully.`);
          }
          // Return to the main menu
          mainMenu();
        }
      );
    });
}
function getRoles() {
  return new Promise((resolve, reject) => {
    connection.query("SELECT * FROM roles", (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

function getManagers(managerId) {
  return new Promise((resolve, reject) => {
    let query = "SELECT * FROM employees WHERE manager_id IS NULL";

    if (managerId) {
      query = `SELECT * FROM employees WHERE manager_id = ${connection.escape(
        managerId
      )}`;
    }

    connection.query(query, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

async function viewEmployeesByDepartment() {
  // Get the list of departments from the database
  const departments = await getDepartments();

  // Prompt for the department to view employees under
  inquirer
    .prompt([
      {
        type: "list",
        name: "departmentId",
        message: "Select a department to view its employees:",
        choices: departments.map((department) => ({
          name: department.name,
          value: department.id,
        })),
      },
    ])
    .then((answer) => {
      // Fetch the list of employees in the selected department
      const query = `
        SELECT e.id, e.first_name, e.last_name, roles.title AS job_title,
               departments.name AS department, roles.salary,
               CONCAT(m.first_name, ' ', m.last_name) AS manager
        FROM employees e
        LEFT JOIN roles ON e.role_id = roles.id
        LEFT JOIN departments ON roles.department_id = departments.id
        LEFT JOIN employees m ON e.manager_id = m.id
        WHERE departments.id = ?
        ORDER BY e.id
      `;

      connection.query(query, [answer.departmentId], (err, employees) => {
        if (err) {
          console.error("Error fetching employees by department:", err);
        } else {
          console.log("\nEmployees in the selected department:");
          console.table(employees);
        }
        // Return to the main menu
        mainMenu();
      });
    });
}


async function viewEmployeesByManager() {
  // Get the list of managers from the database
  const managers = await getManagers();

  // Prompt for the manager to view employees under
  inquirer
    .prompt([
      {
        type: "list",
        name: "managerId",
        message: "Select a manager to view their employees:",
        choices: managers.map((manager) => ({
          name: `${manager.first_name} ${manager.last_name}`,
          value: manager.id,
        })),
      },
    ])
    .then((answer) => {
      // Fetch the list of employees under the selected manager
      connection.query(
        "SELECT * FROM employees WHERE manager_id = ?",
        [answer.managerId],
        (err, employees) => {
          if (err) {
            console.error("Error fetching employees by manager:", err);
          } else {
            console.log("\nEmployees under the selected manager:");
            employees.forEach((employee) => {
              console.log(`${employee.first_name} ${employee.last_name}`);
            });
          }
          // Return to the main menu
          mainMenu();
        }
      );
    });
}

async function addEmployee() {
  // Get the list of roles and managers from the database
  const roles = await getRoles();
  const managers = await getManagers();

  // Prompt for employee details
  inquirer
    .prompt([
      {
        type: "input",
        name: "firstName",
        message: "Enter the first name of the new employee:",
        validate: (input) => {
          if (input.trim() !== "") {
            return true;
          } else {
            return "Please enter a valid first name.";
          }
        },
      },
      {
        type: "input",
        name: "lastName",
        message: "Enter the last name of the new employee:",
        validate: (input) => {
          if (input.trim() !== "") {
            return true;
          } else {
            return "Please enter a valid last name.";
          }
        },
      },
      {
        type: "list",
        name: "roleId",
        message: "Select the role for the new employee:",
        choices: roles.map((role) => ({
          name: role.title,
          value: role.id,
        })),
      },
      {
        type: "list",
        name: "managerId",
        message: "Select the manager for the new employee:",
        choices: [
          { name: "None", value: null },
          ...managers.map((manager) => ({
            name: `${manager.first_name} ${manager.last_name}`,
            value: manager.id,
          })),
        ],
      },
    ])
    .then((answer) => {
      // Insert the new employee into the database
      connection.query(
        "INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)",
        [answer.firstName, answer.lastName, answer.roleId, answer.managerId],
        (err, result) => {
          if (err) {
            console.error("Error adding employee:", err);
          } else {
            console.log(
              `\nEmployee '${answer.firstName} ${answer.lastName}' added successfully.`
            );
          }
          // Return to the main menu
          mainMenu();
        }
      );
    });
}

function getEmployees() {
  return new Promise((resolve, reject) => {
    connection.query("SELECT * FROM employees", (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

async function updateEmployeeManager() {
  // Get the list of employees from the database
  const employees = await getEmployees();

  // Prompt for the employee to update and their new manager
  inquirer
    .prompt([
      {
        type: "list",
        name: "employeeId",
        message: "Select an employee to update their manager:",
        choices: employees.map((employee) => ({
          name: `${employee.first_name} ${employee.last_name}`,
          value: employee.id,
        })),
      },
      {
        type: "list",
        name: "newManagerId",
        message: "Select the new manager for the employee:",
        choices: [
          { name: "None", value: null },
          ...employees.map((manager) => ({
            name: `${manager.first_name} ${manager.last_name}`,
            value: manager.id,
          })),
        ],
      },
    ])
    .then((answer) => {
      // Update the employee's manager in the database
      connection.query(
        "UPDATE employees SET manager_id = ? WHERE id = ?",
        [answer.newManagerId, answer.employeeId],
        (err, result) => {
          if (err) {
            console.error("Error updating employee manager:", err);
          } else {
            console.log("\nEmployee manager updated successfully.");
          }
          // Return to the main menu
          mainMenu();
        }
      );
    });
}

async function updateEmployeeRole() {
  // Get the list of employees and roles from the database
  const employees = await getEmployees();
  const roles = await getRoles();

  // Prompt for the employee to update and their new role
  inquirer
    .prompt([
      {
        type: "list",
        name: "employeeId",
        message: "Select an employee to update their role:",
        choices: employees.map((employee) => ({
          name: `${employee.first_name} ${employee.last_name}`,
          value: employee.id,
        })),
      },
      {
        type: "list",
        name: "newRoleId",
        message: "Select the new role for the employee:",
        choices: roles.map((role) => ({
          name: role.title,
          value: role.id,
        })),
      },
    ])
    .then((answer) => {
      // Update the employee's role in the database
      connection.query(
        "UPDATE employees SET role_id = ? WHERE id = ?",
        [answer.newRoleId, answer.employeeId],
        (err, result) => {
          if (err) {
            console.error("Error updating employee role:", err);
          } else {
            console.log("\nEmployee role updated successfully.");
          }
          // Return to the main menu
          mainMenu();
        }
      );
    });
}



async function deleteEmployee() {
  const employees = await getEmployees();

  inquirer
    .prompt([
      {
        type: "list",
        name: "employeeId",
        message: "Select the employee you want to delete:",
        choices: employees.map((employee) => ({
          name: `${employee.first_name} ${employee.last_name}`,
          value: employee.id,
        })),
      },
    ])
    .then((answer) => {
      connection.query(
        "DELETE FROM employees WHERE id = ?",
        [answer.employeeId],
        (err, result) => {
          if (err) {
            console.error("Error deleting employee:", err);
          } else {
            console.log("\nEmployee deleted successfully.");
          }
          mainMenu();
        }
      );
    });
}

async function viewDepartmentBudget() {
  const departments = await getDepartments();

  inquirer
    .prompt([
      {
        type: "list",
        name: "departmentId",
        message: "Select the department you want to view the utilized budget for:",
        choices: departments.map((department) => ({
          name: department.name,
          value: department.id,
        })),
      },
    ])
    .then((answer) => {
      const query = `
        SELECT departments.id, departments.name, SUM(roles.salary) AS utilized_budget
        FROM employees
        JOIN roles ON employees.role_id = roles.id
        JOIN departments ON roles.department_id = departments.id
        WHERE departments.id = ?
        GROUP BY departments.id, departments.name
      `;

      connection.query(query, [answer.departmentId], (err, results) => {
        if (err) {
          console.error("Error fetching department's utilized budget:", err);
        } else {
          console.table(results);
        }
        mainMenu();
      });
    });
}


// Start the application
mainMenu();
