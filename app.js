// ===== 数据：待办列表存在浏览器本地（localStorage），不需要服务器 =====
const STORAGE_KEY = 'lianxigit.todos';

/** 读取待办；数据坏了也不会让页面报错 */
function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('读取本地数据失败，先用空列表', err);
    return [];
  }
}

function saveTodos(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// ===== 状态：整个应用只有这一份数据 =====
let todos = loadTodos();

// ===== 页面元素 =====
const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const listEl = document.getElementById('todo-list');
const countEl = document.getElementById('todo-count');
const clearDoneBtn = document.getElementById('clear-done');

// ===== 渲染：把数据画到页面上 =====
function render() {
  listEl.innerHTML = '';

  if (todos.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty';
    empty.textContent = '还没有待办，先添加一条吧 👆';
    listEl.appendChild(empty);
  }

  todos.forEach((todo) => {
    const li = document.createElement('li');
    li.className = todo.done ? 'todo done' : 'todo';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.done;
    checkbox.addEventListener('change', () => toggleTodo(todo.id));

    const text = document.createElement('span');
    text.className = 'todo-text';
    // 用 textContent 而不是 innerHTML：用户输入的内容不会被当成 HTML 执行
    text.textContent = todo.text;

    const del = document.createElement('button');
    del.className = 'delete';
    del.type = 'button';
    del.title = '删除';
    del.textContent = '×';
    del.addEventListener('click', () => removeTodo(todo.id));

    li.append(checkbox, text, del);
    listEl.appendChild(li);
  });

  const left = todos.filter((t) => !t.done).length;
  countEl.textContent = `共 ${todos.length} 项，未完成 ${left} 项`;
}

// ===== 行为 =====
function addTodo(text) {
  todos.push({ id: String(Date.now()), text, done: false });
  saveTodos(todos);
  render();
}

function toggleTodo(id) {
  todos = todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
  saveTodos(todos);
  render();
}

function removeTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  saveTodos(todos);
  render();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addTodo(text);
  input.value = '';
  input.focus();
});

clearDoneBtn.addEventListener('click', () => {
  todos = todos.filter((t) => !t.done);
  saveTodos(todos);
  render();
});

// ===== 启动 =====
render();
