var express = require("express");
var bodyParser = require("body-parser");
var _ = require("underscore");

module.exports = function (port, middleware, callback) {
    var app = express();

    if (middleware) {
        app.use(middleware);
    }
    app.use(express.static("public"));
    app.use(bodyParser.json());

    var latestId = 0;
    var todos = [];

    // Create
    app.post("/api/todo", function (req, res) {
        var todo = req.body;
        todo.id = latestId.toString();
        latestId++;
        todos.push(todo);
        res.set("Location", "/api/todo/" + todo.id);
        res.sendStatus(201);
    });

    // Update task title
    app.put("/api/todo/title/:id", function (req, res) {
        for (var i = 0; i < todos.length; ++i) {
            if (todos[i].id === req.params.id) {
                todos[i].title = req.body.title;
                res.sendStatus(200);
                return;
            }
        }
        res.sendStatus(404);
    });

    // Complete task
    app.put("/api/todo/complete/:id", function (req, res) {
        for (var i = 0; i < todos.length; ++i) {
            if (todos[i].id === req.params.id) {
                todos[i].isComplete = !todos[i].isComplete;
                res.sendStatus(200);
                return;
            }
        }
        res.sendStatus(404);
    });

    // Read
    app.get("/api/todo", function (req, res) {
        res.json(todos);
    });

    // Delete
    app.delete("/api/todo/:id", function (req, res) {
        var id = req.params.id;
        var todo = getTodo(id);
        if (todo) {
            todos = todos.filter(function (otherTodo) {
                return otherTodo !== todo;
            });
            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
    });

    // Delete completed tasks
    app.delete("/api/todo", function (req, res) {
        var oldTodos = todos;
        todos = todos.filter(function (todo) {
            return !todo.isComplete;
        });
        if (oldTodos.length !== todos.length) {
            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
    });

    function getTodo(id) {
        var filteredTodos = _.find(todos, function (todo) {
            return todo.id === id;
        });
        return filteredTodos;
    }

    var server = app.listen(port, callback);

    // We manually manage the connections to ensure that they're closed when calling close().
    var connections = [];
    server.on("connection", function (connection) {
        connections.push(connection);
    });

    return {
        close: function (callback) {
            connections.forEach(function (connection) {
                connection.destroy();
            });
            server.close(callback);
        }
    };
};
