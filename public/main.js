var todoList = document.getElementById("todo-list");
var activeTasks = document.getElementById("active-tasks"); 
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var error = document.getElementById("error");

var states = {
    All: 0,
    Active: 1,
    Completed: 2
};
var filterState = states.All;

form.onsubmit = function(event) {
    var title = todoTitle.value;
    createTodo(title, function() {
        reloadTodoList();
    });
    todoTitle.value = "";
    event.preventDefault();
};

function createTodo(title, callback) {
    fetch("./api/todo", {
        method: "post",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({
            title: title,
            isComplete: false
        })
    }).then(function(response) {
        if (response.status !== 201) {
            error.textContent = "Failed to create item. Server returned " + this.status + " - " + this.responseText;
            return;
        }
    }).then(callback);
}

function deleteTodo(id, callback) {
    fetch("./api/todo/" + id, {method: "delete"}).then(function(response) {
        if (response.status !== 200) {
            error.textContent = "Failed to delete item. Server returned " + response.status + " - " + response.status;
            return;
        }
    }).then(callback);
}

function completeTodo(id, callback) {
    fetch("./api/todo/complete/" + id, {method: "put"}).then(function(response) {
        if (response.status !== 200) {
            error.textContent = "Failed to complete item. Server returned " + response.status +
            " - " + response.responseText;
            return;
        }
    }).then(callback);
}

function deleteCompleted(callback) {
    fetch("./api/todo", {method: "delete"}).then(function(response) {
        if (response.status !== 200) {
            error.textContent = "Failed to delete completed items. Server returned " +
            response.status + " - " + response.status;
            return;
        }
    }).then(callback);
}

function getTodoList(callback) {
    fetch("./api/todo").then(function(response) {
            if (response.status !== 200) {
                error.textContent = "Failed to get list. Server returned " + response.status + " - " + response.status;
                return;
            }
            response.json().then(callback);
        }
    );
}

function reloadTodoList() {
    getTodoList(function(todos) {
        while (todoList.firstChild) {
            todoList.removeChild(todoList.firstChild);
        }
        todoList.appendChild(createButton("All", "button", function () {
            filterState = states.All;
            reloadTodoList();
        }));
        todoList.appendChild(createButton("Active", "button", function () {
            filterState = states.Active;
            reloadTodoList();
        }));
        todoList.appendChild(createButton("Completed", "button", function () {
            filterState = states.Completed;
            reloadTodoList();
        }));
        todoList.appendChild(createButton("Delete Completed", "button deleteButton", function () {
            deleteCompleted(reloadTodoList);
        }));
        var numComp = 0;
        todos.forEach(function(todo) {
            var listItem = document.createElement("li");
            listItem.textContent = todo.title;
            listItem.appendChild(createButton("Delete", "button deleteButton", function () {
                deleteTodo(todo.id, reloadTodoList);
            }));
            var name = (!todo.isComplete) ? "Complete" : "Uncomplete";
            if (todo.isComplete) {
                listItem.className = listItem.className + " complete";
                numComp++;
            }
            listItem.appendChild(createButton(name, "button completeButton", function () {
                completeTodo(todo.id, reloadTodoList);
            }));
            if ((filterState === states.All) ||
            ((filterState === states.Active) && !todo.isComplete) ||
            ((filterState === states.Completed) && todo.isComplete)) {
                todoList.appendChild(listItem);
            }
        });
        if (activeTasks.firstChild) {
            activeTasks.removeChild(activeTasks.firstChild);
        }
        var label = document.createElement("label");
        label.innerText = (todoList.childNodes.length - numComp - 4) + " task(s) left to complete";
        activeTasks.appendChild(label);
        if (!numComp) {
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
