const inquirer = require("inquirer");
const mysql = require("mysql");
const { config } = require("./creds");

const connection = mysql.createConnection(config);

connection.connect((err) => {
    if (err) {
        console.log(err);
    }
});

function start() {
    console.log("Welcome to the Employee Tracker!")
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
                break;

            case "View Employees By Department":
                break;

            case "Add Employee":
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

start();