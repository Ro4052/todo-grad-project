var todoList = document.getElementById("todo-list");
var activeTasks = document.getElementById("active-tasks");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var updateForm = document.getElementById("todo-update");
var updateId = document.getElementById("todo-id");
var updateTitle = document.getElementById("todo-title");
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

updateForm.onsubmit = function(event) {
    getTodoList(function(todos) {
        fetch("./api/todo/title/" + (todos[updateId.value].id - 1), {
            method: "put",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({
                title: updateTitle.value,
            })
        }).then(function(response) {
            if (response.status !== 200) {
                error.textContent = "Failed to update title. Server returned " + this.status + " - " +
                this.responseText;
                return;
            }
        });
    });
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
        standardButtons();
        var numComp = 0;
        todos.forEach(function(todo) {
            var listItem = document.createElement("li");
            listItem.textContent = todo.title;
            listItem.appendChild(addElement("button", "Delete", "button deleteButton", function () {
                deleteTodo(todo.id, reloadTodoList);
            }));
            if (todo.isComplete) {
                listItem.className = listItem.className + " complete";
                numComp++;
            }
            var name = (!todo.isComplete) ? "Complete" : "Uncomplete";
            listItem.appendChild(addElement("button", name, "button completeButton", function () {
                completeTodo(todo.id, reloadTodoList);
            }));
            if ((filterState === states.All) ||
            ((filterState === states.Active) && !todo.isComplete) ||
            ((filterState === states.Completed) && todo.isComplete)) {
                todoList.appendChild(listItem);
            }
        });
        addLabel(todos.length - numComp);
        if (!numComp) {
            todoList.removeChild(todoList.childNodes[3]);
        }
    });
}

function standardButtons() {
    todoList.appendChild(addElement("button", "All", "button", function () {
        filterState = states.All;
        reloadTodoList();
    }));
    todoList.appendChild(addElement("button", "Active", "button", function () {
        filterState = states.Active;
        reloadTodoList();
    }));
    todoList.appendChild(addElement("button", "Completed", "button", function () {
        filterState = states.Completed;
        reloadTodoList();
    }));
    todoList.appendChild(addElement("button", "Delete Completed", "button deleteButton", function () {
        deleteCompleted(reloadTodoList);
    }));
}

function addLabel(num) {
    if (activeTasks.firstChild) {
        activeTasks.removeChild(activeTasks.firstChild);
    }
    activeTasks.appendChild(addElement("label", num + " task(s) left to complete", "", function() {}));
}

function addElement(type, text, cssClass, clickFunc) {
    var element = document.createElement(type);
    element.innerText = text;
    element.className = cssClass;
    element.onclick = clickFunc;
    return element;
}

reloadTodoList();
