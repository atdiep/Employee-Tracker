var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "iloveanime7",
  database: "top_songsDB"
});

connection.connect(function(err) {
  if (err) throw err;
  runSearch();
});

function runOptions() {
    inquirer
        .prompt({
            name: "action",
            type: "rawlist",
            message: "What would you like to do?",
            choices: [
                "View All Employees",
                "View All Departments",
                "View All Roles",
                "Add Employee",
                "Add Department",
                "Add Role",
                "Update Employee Role",
                "Update Employee Manager",
                "View All Employees By Department",
                "View All Employees by Manager",
                "Remove Employee",
                "Remove Department",
                "Remove Role",
                "View Total Utilized Budget By Department"
            ]
        })
}