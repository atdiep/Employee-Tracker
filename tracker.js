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
    var query = `SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name AS Department, CONCAT(emp.first_name, " ", emp.last_name) AS Manager FROM employee `;
    query += "LEFT JOIN role ON employee.role_id = role.id ";
    query += "LEFT JOIN department ON role.department_id = department.id ";
    query += "LEFT JOIN employee AS emp ON employee.manager_id = emp.id";
    connection.query(query, function (err, res) {
        if (err) throw err;
        console.table(res)
        runOptions();
    });
}

function allDepartments() {
    connection.query("SELECT department.name FROM department", function (err, res) {
        if (err) throw err;
        console.table(res);
        runOptions();
    });
}

function allRoles() {
    connection.query("SELECT role.title FROM role", function (err, res) {
        if (err) throw err;
        console.table(res);
        runOptions();
    });
}

async function addEmployee() {
    let queryArray = []
    connection.query("SELECT role.title FROM role", function (err, result) {
        if (err) throw err;
        for (let i = 0; i < result.length; i++) {
            queryArray.push(result[i]);
        }
        showPrompt(queryArray);
    });

    function showPrompt(roles) {
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
                    choices: roles
                }
            ]).then(showManagerPrompt(answers));


        function showManagerPrompt(lastAnswers) {
            connection.query(`SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name AS Department, CONCAT(emp.first_name, " ", emp.last_name) AS Manager FROM employee 
            LEFT JOIN role ON employee.role_id = role.id 
            LEFT JOIN department ON role.department_id = department.id 
            LEFT JOIN employee AS emp ON employee.manager_id = emp.id"`, function (err, res) {
                    if (err) throw err;
                    let managers = [];
                    for (let i = 0; i < res.length; i++) {
                        managers.push(res[i])
                    }
                    inquirer
                        .prompt([
                            {
                                name: "employeeManager",
                                type: "list",
                                message: "Who is the employee's manager?",
                                choices: managers
                            }
                        ]).then(function (answer) {
                            connection.query("INSERT INTO employee SET ?", {
                                first_name: lastAnswers.employeeFirst,
                                last_name: lastAnswers.employeeLast,
                                title: lastAnswers.employeeRole,
                                manager_id: answer.employeeManager,
                            }, function (err, res) {
                                if (err) throw err;
                                console.log(res.affectedRows + " is added!\n");
                                runOptions()
                            });
                        });
                });
        }
    }
}

function addDepartment() {
    inquirer.prompt({
        name: "departmentName",
        type: "input",
        message: "What is your department's name?"
    }).then(function (answer) {
        connection.query("INSERT INTO department SET ?", {
            name: answer.departmentName
        }, function (err, res) {
            if (err) throw err;
            console.log(res.affectedRows + " is added!\n")
            runOptions();
        })
    })
}

function addRole() {
    let query = `SELECT * FROM department
    LEFT JOIN department ON role.department_id = department.id`
    connection.query(query, function (err, res) {
        if (err) throw err;
        let deptChoices = res.map(data => ({
            id: data.id,
            name: data.name
        }));
        inquirer.prompt([
            {
                name: "roleName",
                type: "input",
                message: "What is your department's role?"
            },
            {
                name: "roleSalary",
                type: "input",
                message: "What is the role's salary?"
            },
            {
                name: "roleDepartment",
                type: "list",
                message: "What is your department?",
                choices: deptChoices
            }
        ]).then(function (answers) {
            var query = "INSERT INTO role SET ?";
            connection.query(query, {
                title: answers.roleName,
                salary: answers.roleSalary,
                department_id: answers.roleDepartment
            }, function (err, res) {
                if (err) throw err;
                console.log(res.affectedRows + " is added!\n")
            });
        });
    })
}


function updateEmployeeRole() {
    inquirer.prompt([
        {
            name: "employeeList",
            type: "list",
            message: "Which employee's role do you want you update?",
            choices: "SELECT * FROM employee"
        },
        {
            name: "updatedRole",
            type: "list",
            message: "Which role do you want to change to?",
            choices: "SELECT * FROM role"
        }
    ]).then(function (answer) {
        connection.query("UPDATE employee SET ? WHERE ?",
            {
                role_id: answer.updatedRole
            }, function (err, res) {
                if (err) throw err;
                console.log(res.affectedRows + " | is updated")
                runOptions();
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
    ]).then(function (answer) {
        connection.query("UPDATE employee SET ? WHERE ?",
            {
                manager_id: answer.updatedManager
            }, function (err, res) {
                if (err) throw err;
                console.log(res.affectedRows + " | is updated")
                runOptions();
            });
    });
}

function employeesByDepartment() {
    let query = `SELECT * FROM department`
    connection.query(query, function (err, res) {
        if (err) throw err;
        let deptChoices = res.map(data => ({
            id: data.id,
            name: data.name
        }));
        inquirer.prompt({
            name: "departmentList",
            type: "list",
            message: "Which department do you want to view?",
            choices: deptChoices
        }).then(function (answer) {
            var query = `SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name AS Department, CONCAT(emp.first_name, " ", emp.last_name) AS Manager FROM employee `;
            query += "LEFT JOIN role ON employee.role_id = role.id ";
            query += "LEFT JOIN department ON role.department_id = department.id "
            query += "LEFT JOIN employee AS emp ON employee.manager_id = emp.id WHERE department.name = ? ";
            connection.query(query, [answer.departmentList] , function (err, res) {
                if (err) throw err;
                console.table(res);
                runOptions();
            })
        })
    });
}
// function employeesByManager()

// function removeEmployee()

// function removeDepartment()

// function removeRole()

// function totalBudget()