var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var error = document.getElementById("error");
var filterState = 0;

form.onsubmit = function(event) {
    var title = todoTitle.value;
    createTodo(title, function() {
        reloadTodoList();
    });
    todoTitle.value = "";
    event.preventDefault();
};

function createTodo(title, callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("POST", "/api/todo");
    createRequest.setRequestHeader("Content-type", "application/json");
    createRequest.send(JSON.stringify({
        title: title,
        isComplete: false
    }));
    createRequest.onload = function() {
        if (this.status === 201) {
            callback();
        } else {
            error.textContent = "Failed to create item. Server returned " + this.status + " - " + this.responseText;
        }
    };
}

function deleteTodo(id, callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("DELETE", "/api/todo/" + id);
    createRequest.send();
    createRequest.onload = function() {
        if (this.status === 200) {
            callback();
        } else {
            error.textContent = "Failed to delete item. Server returned " + this.status + " - " + this.responseText;
        }
    };
}

function completeTodo(id, callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("PUT", "/api/todo/complete/" + id);
    createRequest.send();
    createRequest.onload = function() {
        if (this.status === 200) {
            callback();
        } else {
            error.textContent = "Failed to complete item. Server returned " + this.status + " - " + this.responseText;
        }
    };
}

function deleteCompleted(callback) {
    getTodoList(function(todos) {
        var delList = [];
        for (var i = 0; i < todos.length; ++i) {
            if (todos[i].isComplete) {
                deleteTodo(todos[i].id, function () {});
            }
        }
    });
    setTimeout(callback, 15);
}

function getTodoList(callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("GET", "/api/todo");
    createRequest.onload = function() {
        if (this.status === 200) {
            callback(JSON.parse(this.responseText));
        } else {
            error.textContent = "Failed to get list. Server returned " + this.status + " - " + this.responseText;
        }
    };
    createRequest.send();
}

function reloadTodoList() {
    while (todoList.firstChild) {
        todoList.removeChild(todoList.firstChild);
    }
    todoListPlaceholder.style.display = "block";
    getTodoList(function(todos) {
        todoListPlaceholder.style.display = "none";
        todoList.appendChild(createButton("All", "button", function () {
            filterState = 0;
            reloadTodoList();
        }));
        todoList.appendChild(createButton("Active", "button", function () {
            filterState = 1;
            reloadTodoList();
        }));
        todoList.appendChild(createButton("Completed", "button", function () {
            filterState = 2;
            reloadTodoList();
        }));
        todoList.appendChild(createButton("Delete Completed", "button taskButton", function () {
            deleteCompleted(reloadTodoList);
        }));
        var drawButton = false;
        todos.forEach(function(todo) {
            var listItem = document.createElement("li");
            listItem.textContent = todo.title;
            listItem.appendChild(createButton("Delete", "button taskButton", function () {
                deleteTodo(todo.id, reloadTodoList);
            }));
            if (!todo.isComplete) {
                listItem.appendChild(createButton("Complete", "button taskButton", function () {
                    completeTodo(todo.id, reloadTodoList);
                }));
            } else {
                listItem.className = listItem.className + " complete";
                drawButton = true;
            }
            if ((filterState === 0) ||
            ((filterState === 1) && !todo.isComplete) ||
            ((filterState === 2) && todo.isComplete)) {
                todoList.appendChild(listItem);
            }
        });
        if (!drawButton) {
            todoList.removeChild(todoList.childNodes[3]);
        }
    });
}

function createButton(text, cssClass, clickFunc) {
    var button = document.createElement("button");
    button.innerText = text;
    button.className = cssClass;
    button.onclick = clickFunc;
    return button;
}

reloadTodoList();
