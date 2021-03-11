const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if(!user) {
    return response.status(404).json({ error: 'User not found' });
  }

  request.user = user;

  return next();
}

function checksExistsUserTodo(request, response, next) {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find(todo => todo.id === id);

  if(!todo) {
    return response.status(404).json({ error: 'Todo not found' });
  }

  request.todo = todo;

  return next();
}

app.post('/users', (request, response) => {
  const {
    name,
    username
  } = request.body;

  const usernameAlreadyExists = users.some(user => user.username === username);

  if(usernameAlreadyExists) {
    return response.status(400).json({ error: 'User already exists'})
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);

  return response.status(201).json(user);
});

app.use(checksExistsUserAccount);

app.get('/todos', (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserTodo, (request, response) => {
  const { todo } = request;
  const { title, deadline } = request.body;

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserTodo, (request, response) => {
  const { todo } = request;

  todo.done = true;

  return response.status(200).json(todo)
});

app.delete('/todos/:id', checksExistsUserTodo, (request, response) => {
  const { user, todo } = request;

  user.todos.splice(todo, 1);

  return response.status(204).send();
});

module.exports = app;