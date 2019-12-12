var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "trackerDB"
});

connection.connect(function (err) {
    if (err) throw err;
    runOptions();
});

function runOptions() {
    inquirer
        .prompt({
            name: "action",
            type: "list",
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
        .then(function (answer) {
            switch (answer.action) {
                case "View All Employees":
                    allEmployees();
                    break;
                case "View All Departments":
                    allDepartments();
                    break;
                case "View All Roles":
                    allRoles();
                    break;
                case "Add Employee":
                    addEmployee();
                    break;
                case "Add Department":
                    addDepartment();
                    break;
                case "Add Role":
                    addRole();
                    break;
                case "Update Employee Role":
                    updateEmployeeRole();
                    break;
                case "Update Employee Manager":
                    updateEmployeeManager();
                    break;
                case "View All Employees By Department":
                    employeesByDepartment();
                    break;
                case "View All Employees by Manager":
                    employeesByManager();
                    break;
                case "Remove Employee":
                    removeEmployee();
                    break;
                case "Remove Department":
                    removeDepartment();
                    break;
                case "Remove Role":
                    removeRole();
                    break;
                case "View Total Utilized Budget By Department":
                    totalBudget();
                    break;
            }
        });
}

function allEmployees() {
    connection.query("SELECT * FROM employee, department, role", function (err, res) {
        if (err) throw err;
        console.table(res)
    });
}

function allDepartments() {
    connection.query("SELECT * FROM department", function (err, res) {
        if (err) throw err;
        for (let i = 0; i < res.length; i++) {
            console.log(res[i].id + " | " + res[i].name)
        }
    });
}

function allRoles() {
    connection.query("SELECT * FROM role", function (err, res) {
        if (err) throw err;
        for (let i = 0; i < res.length; i++) {
            console.log(res[i].id + " | " + res[i].title)
        }
    });
}

function addEmployee() {
    inquirer
        .prompt([
            {
                name: "employeeFirst",
                type: "input",
                message: "What is the employee's first name?"
            },
            {
                name: "employeeLast",
                type: "input",
                message: "What is the employee's last name?"
            },
            {
                name: "employeeRole",
                type: "list",
                message: "What is the employee's role?",
                choices: "SELECT * FROM role GROUPBY title"
            },
            {
                name: "employeeManager",
                type: "list",
                message: "What is the employee's manager?",
                choices: "SELECT * FROM employee GROUPBY manager_id"
            }
        ]).then(function (answer) {
            var query = connection.query("INSERT INTO employee SET ?", {
                first_name: answer.employeeFirst,
                last_name: answer.employeeLast,
                title: answer.employeeRole,
                manager_id: answer.employeeManager,
            }, function (err, res) {
                if (err) throw err;
                console.log(res.affectedRows + " is added!\n");
            });
        });
}

function addDepartment() {
    inquirer.prompt({
        name: "departmentName",
        type: "input",
        message: "What is your department's name?"
    }).then(function (answer) {
        var query = connection.query("INSERT INTO department SET ?", {
            name: answer.departmentName
        }, function (err, res) {
            if (err) throw err;
            console.log(res.affectedRows + " is added!\n")
        })
    })
}

function addRole() {
    inquirer.prompt({
        name: "roleName",
        type: "input",
        message: "What is your department's role?"
    }).then(function (answer) {
        var query = connection.query("INSERT INTO role SET ?", {
            title: answer.roleName
        }, function (err, res) {
            if (err) throw err;
            console.log(res.affectedRows + " is added!\n")
        });
    });
}

function updateEmployeeRole() {
    inquirer.prompt([
        {
            name: "employeeList",
            type: "list",
            message: "Which employee do you want you update?",
            choices: "SELECT * FROM employee"
        },
        {
            name: "updatedRole",
            type: "list",
            message: "Which role do you want to change to?",
            choices: "SELECT * FROM role"
        }
    ]).then(function(answer) {
        var query = connection.query("UPDATE employee SET ? WHERE ?", 
        {
            role_id: answer.updatedRole
        }, function(err, res) {
            if(err) throw err;
            console.log(res.affectedRows + " | is updated")
        });
    });
}

function updateEmployeeManager() {
    inquirer.prompt([
        {
            name: "employeeList",
            type: "list",
            message: "Which employee do you want you update?",
            choices: "SELECT * FROM employee"
        },
        {
            name: "updatedManager",
            type: "list",
            message: "Which manager do you want to change to?",
            choices: "SELECT * FROM employee"
        }
    ]).then(function(answer) {
        var query = connection.query("UPDATE employee SET ? WHERE ?", 
        {
            manager_id: answer.updatedManager
        }, function(err, res) {
            if(err) throw err;
            console.log(res.affectedRows + " | is updated")
        });
    });
}

function employeesByDepartment() {
    inquirer.prompt({
        name: "departmentList",
        type: "list",
        message: "Which department do you want to view?",
        choices: "SELECT * FROM department"
    }).then(function(answer) {
        var query = "SELECT name FROM department WHERE ?";
        connection.query(query, { name: answer.departmentList }, function(err, res) {

        })
    })
}
// function employeesByManager()

// function removeEmployee()

// function removeDepartment()

// function removeRole()

// function totalBudget()