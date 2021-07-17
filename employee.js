const inquirer = require("inquirer");
const mysql = require("mysql");
const cTable = require("console.table");
const { config } = require("./creds");

const connection = mysql.createConnection(config);

connection.connect((err) => {
    if (err) {
        console.log(err);
    }
});

function start() {
    inquirer.prompt(
        {
            type: "list",
            message: "What would you like to do?",
            name: "choice",
            choices: ["View All Employees", "View Employees By Department", "Add Employee", "Update Employee Role", "Add Role", "Add Department", "Exit"]
        }
    ).then(({ choice }) => {
        switch (choice) {
            case "View All Employees":
                viewAllEmployees();
                break;

            case "View Employees By Department":
                viewEmployeesByDepartment();
                break;

            case "Add Employee":
                addEmployee();
                break;

            case "Update Employee Role":
                break;

            case "Add Role":
                break;

            case "Add Department":
                break;

            case "Exit":
                connection.end();
                break;
        }
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
            `select d.name from department d;`, (err, results) => {
            if (err) {
                reject(new Error(err.message));
            }
            results.forEach(element => {
                currentDepartments.push({ name: element.name });
            });
            resolve(currentDepartments);
        });
    });
}

function getManagerNames(arr) {
    let nameArr = ["None"];
    arr.forEach(manager => {
        nameArr.push(`${manager.first_name} ${manager.last_name}`);
    });
    return nameArr;
}

function getRoleTitles(arr) {
    let rolesArr = [];
    arr.forEach(role => {
        rolesArr.push(`${role.title}`);
    });
    return rolesArr;
}

function getManagerId(managerArr, managerName) {
    for (managerData of managerArr) {
        let manager = `${managerData.first_name} ${managerData.last_name}`;
        if (manager == managerName) {
            return managerData.id;
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

function viewAllEmployees() {
    connection.query(
        `select e.id, e.first_name, e.last_name, r.title, d.name, r.salary, concat(ee.first_name, " ", ee.last_name) as "manager" from employee e
        inner join role r on e.role_id = r.id 
        inner join department d on r.department_id = d.id
        left join employee ee on e.manager_id = ee.id;`, (err, result) => {
        if (err) throw err;
        console.table(result);
        start();
    });
}

async function viewEmployeesByDepartment() {
    let currentDepartments = await getDepartments();
    inquirer.prompt([
        {
            type: "list",
            message: "What department would you like to view?",
            name: "departmentName",
            choices: currentDepartments
        },
    ]).then(({ departmentName }) => {
        connection.query(
            `select e.id, e.first_name, e.last_name, r.title, d.name, r.salary, concat(ee.first_name, " ", ee.last_name) as "manager" from employee e
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
            choices: getManagerNames(currentManagers)
        },
    ]).then(({ first_name, last_name, role, manager }) => {
        connection.query(
            'INSERT INTO employee SET ?',
            {
                first_name: first_name,
                last_name: last_name,
                role_id: getRoleId(currentRoles, role),
                manager_id: getManagerId(currentManagers, manager),
            },
            (err) => {
                if (err) throw err;
                console.log('Successfully added employee!');
                start();
            }
        );
    });
}

console.log("Welcome to the Employee Tracker!");
start();


// let getManagers = () => {
//     let query = 'SELECT id,first_name, last_name, manager_id,role_id FROM employee';
//     query += ' WHERE manager_id IS NULL;';
//     return new Promise((resolve, reject) => {
//         connection.query(query, (err, res) => {
//             if (err) {
//                 reject(new Error(err.message));
//             }
//             let employees = [];
//             res.forEach(({ id, first_name, last_name, manager_id, roleId }) => {
//                 let emp = new Employee(id, first_name, last_name, manager_id, roleId);
//                 employees.push(emp);
//             });
//             resolve(employees);
//         })
//     });
// };

// case 'View All Managers':
//                     getManagers()
//                         .then((response) => {
//                             displayResults(response);
//                         })
//                         .then(() => runSearch())
//                         .catch((err) => console.error('Promise rejected:', err));
//                     break;