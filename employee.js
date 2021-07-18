// Requiring all of the required dependencies to run
const inquirer = require("inquirer");
const mysql = require("mysql");
const cTable = require("console.table");
const { config } = require("./creds");

// We create a connection to the mySQL database. You should load up the employeeDb.sql in mySQL workbench to initialize the database as well as the seeded data
const connection = mysql.createConnection(config);
connection.connect((err) => {
    if (err) {
        console.log(err);
    }
});

// This function displays all of the features of the app as options
function start() {
    inquirer.prompt(
        {
            type: "list",
            message: "What would you like to do?",
            name: "choice",
            choices: ["View All Employees", "View Employees By Department", "View Employees By Role", "Add Employee", "Update Employee Role", "Add Role", "Add Department", "Exit"]
        }
    ).then(({ choice }) => {
        switch (choice) {
            case "View All Employees":
                viewAllEmployees();
                break;

            case "View Employees By Department":
                viewEmployeesByDepartment();
                break;

            case "View Employees By Role":
                viewEmployeesByRole();
                break;

            case "Add Employee":
                addEmployee();
                break;

            case "Update Employee Role":
                updateRole();
                break;

            case "Add Role":
                addRole();
                break;

            case "Add Department":
                addDepartment();
                break;

            case "Exit":
                // Exiting ends the mySQL connection to the database
                connection.end();
                break;
        }
    });
}

// This set of functions gets and returns arrays of the specified data from the database using promises
function getEmployees() {
    let currentEmployees = [];
    return new Promise((resolve, reject) => {
        connection.query(
            `select e.id, e.first_name, e.last_name, e.role_id from employee e;`, (err, results) => {
                if (err) {
                    reject(new Error(err.message));
                }
                results.forEach(element => {
                    currentEmployees.push({ id: element.id, first_name: element.first_name, last_name: element.last_name, role_id: element.role_id });
                });
                resolve(currentEmployees);
            });
    });
}

function getRoles() {
    let currentRoles = [];
    return new Promise((resolve, reject) => {
        connection.query(
            `select r.title, r.id from role r;`, (err, results) => {
                if (err) {
                    reject(new Error(err.message));
                }
                results.forEach(element => {
                    currentRoles.push({ id: element.id, title: element.title });
                });
                resolve(currentRoles);
            });
    });
}

function getManagers() {
    let currentManagers = [];
    return new Promise((resolve, reject) => {
        connection.query(
            `select e.id, e.first_name, e.last_name from employee e
            where e.manager_id is null;`, (err, results) => {
            if (err) {
                reject(new Error(err.message));
            }
            results.forEach(element => {
                currentManagers.push({ id: element.id, first_name: element.first_name, last_name: element.last_name });
            });
            resolve(currentManagers);
        });
    });
}

function getDepartments() {
    let currentDepartments = [];
    return new Promise((resolve, reject) => {
        connection.query(
            `select d.name, d.id from department d;`, (err, results) => {
                if (err) {
                    reject(new Error(err.message));
                }
                results.forEach(element => {
                    currentDepartments.push({ id: element.id, name: element.name });
                });
                resolve(currentDepartments);
            });
    });
}

// This set of functions grabs the names of the data and returns an array of just the names to be displayed as choices in inquirer
function getEmployeeNames(arr, managerOrNot) {
    let nameArr = [];
    if (managerOrNot) {
        nameArr.push("None");
    }
    arr.forEach(manager => {
        nameArr.push(`${manager.first_name} ${manager.last_name}`);
    });
    return nameArr;
}

function getRoleTitles(arr) {
    let roleArr = [];
    arr.forEach(role => {
        roleArr.push(`${role.title}`);
    });
    return roleArr;
}

function getDepartmentNames(arr) {
    let departmentArr = [];
    arr.forEach(department => {
        departmentArr.push(`${department.name}`);
    });
    return departmentArr;
}

// This set of functions takes in the name of the data and then grabs the associated id
function getEmployeeId(employeeArr, employeeName) {
    for (employeeData of employeeArr) {
        let employee = `${employeeData.first_name} ${employeeData.last_name}`;
        if (employee == employeeName) {
            return employeeData.id;
        }
    }
}

function getRoleId(roleArr, roleName) {
    for (roleData of roleArr) {
        let role = `${roleData.title}`;
        if (role == roleName) {
            return roleData.id;
        }
    }
}

function getDepartmentId(departmentArr, departmentName) {
    for (departmentData of departmentArr) {
        let department = `${departmentData.name}`;
        if (department == departmentName) {
            return departmentData.id;
        }
    }
}

// This set of functions displays the data using console.table
function viewAllEmployees() {
    connection.query(
        `select e.id, e.first_name, e.last_name, r.title, d.name as "department", r.salary, concat(ee.first_name, " ", ee.last_name) as "manager" from employee e
        inner join role r on e.role_id = r.id 
        inner join department d on r.department_id = d.id
        left join employee ee on e.manager_id = ee.id;`, (err, result) => {
        if (err) throw err;
        console.table(result);
        start();
    });
}

async function viewEmployeesByRole() {
    let currentRoles = await getRoles();
    inquirer.prompt([
        {
            type: "list",
            message: "What role would you like to view?",
            name: "roleTitle",
            choices: getRoleTitles(currentRoles)
        },
    ]).then(({ roleTitle }) => {
        connection.query(
            `select e.id, e.first_name, e.last_name, r.title, d.name as "department", r.salary, concat(ee.first_name, " ", ee.last_name) as "manager" from employee e
            inner join role r on e.role_id = r.id 
            inner join department d on r.department_id = d.id
            left join employee ee on e.manager_id = ee.id
            where r.title = '${roleTitle}';`, (err, result) => {
            if (err) throw err;
            console.table(result);
            start();
        });
    });
}

async function viewEmployeesByDepartment() {
    let currentDepartments = await getDepartments();
    inquirer.prompt([
        {
            type: "list",
            message: "What department would you like to view?",
            name: "departmentName",
            choices: getDepartmentNames(currentDepartments)
        },
    ]).then(({ departmentName }) => {
        connection.query(
            `select e.id, e.first_name, e.last_name, r.title, d.name as "department", r.salary, concat(ee.first_name, " ", ee.last_name) as "manager" from employee e
            inner join role r on e.role_id = r.id 
            inner join department d on r.department_id = d.id
            left join employee ee on e.manager_id = ee.id
            where d.name = '${departmentName}';`, (err, result) => {
            if (err) throw err;
            console.table(result);
            start();
        });
    });
}

// This set of functions adds the specified type of data to the database
async function addEmployee() {
    let currentRoles = await getRoles();
    let currentManagers = await getManagers();

    inquirer.prompt([
        {
            type: "input",
            message: "What is the employee's first name?",
            name: "first_name"
        },
        {
            type: "input",
            message: "What is the employee's last name?",
            name: "last_name"
        },
        {
            type: "list",
            message: "What is the employee's role?",
            name: "role",
            choices: getRoleTitles(currentRoles)
        },
        {
            type: "list",
            message: "Who is the employee's manager?",
            name: "manager",
            choices: getEmployeeNames(currentManagers, true)
        },
    ]).then(({ first_name, last_name, role, manager }) => {
        connection.query(
            'insert into employee set ?',
            {
                first_name: first_name,
                last_name: last_name,
                role_id: getRoleId(currentRoles, role),
                manager_id: getEmployeeId(currentManagers, manager),
            },
            (err) => {
                if (err) throw err;
                console.log('Successfully added employee!');
                start();
            }
        );
    });
}

async function addRole() {
    let currentDepartments = await getDepartments();

    inquirer.prompt([
        {
            type: "input",
            message: "What is the new role's title?",
            name: "title"
        },
        {
            type: "input",
            message: "What is the salary of this role?",
            name: "salary"
        },
        {
            type: "list",
            message: "What is the department of this role?",
            name: "department",
            choices: getDepartmentNames(currentDepartments)
        },
    ]).then(({ title, salary, department }) => {
        connection.query(
            'insert into role set ?',
            {
                title: title,
                salary: salary,
                department_id: getDepartmentId(currentDepartments, department),
            },
            (err) => {
                if (err) throw err;
                console.log('Successfully added role!');
                start();
            }
        );
    });
}

function addDepartment() {
    inquirer.prompt([
        {
            type: "input",
            message: "What is the new department's name?",
            name: "name"
        },
    ]).then(({ name }) => {
        connection.query(
            'insert into department set ?',
            {
                name: name
            },
            (err) => {
                if (err) throw err;
                console.log('Successfully added department!');
                start();
            }
        );
    });
}

// This function updates the role of a specific employee
async function updateRole() {
    let currentRoles = await getRoles();
    let currentEmployees = await getEmployees();
    console.log(currentEmployees);

    inquirer.prompt([
        {
            type: "list",
            message: "Which employee would you like to update?",
            name: "employee",
            choices: getEmployeeNames(currentEmployees, false)
        },
        {
            type: "list",
            message: "What is the employee's new role?",
            name: "role",
            choices: getRoleTitles(currentRoles)
        }
    ]).then(({ employee, role }) => {
        connection.query(
            `update employee e set e.role_id = ${getRoleId(currentRoles, role)} 
            where e.id = ${getEmployeeId(currentEmployees, employee)}`,
            (err) => {
                if (err) throw err;
                console.log('Successfully changed role!');
                start();
            }
        );
    });
}

// Here is the initial call to start the app as well as a starting message
console.log("Welcome to the Employee Tracker!");
start();