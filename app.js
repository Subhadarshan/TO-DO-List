// app.js — compiled from app.ts (simplified for demo)
class Store {
  constructor() {
    this.key = 'todo-ts-items';
    this.filterKey = 'todo-ts-filter';
  }
  load() {
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
  save(items) {
    localStorage.setItem(this.key, JSON.stringify(items));
  }
  loadFilter() {
    const f = localStorage.getItem(this.filterKey);
    return f ?? 'all';
  }
  saveFilter(f) {
    localStorage.setItem(this.filterKey, f);
  }
}
class TodoApp {
  constructor() {
    this.items = [];
    this.filter = 'all';
    this.store = new Store();
    this.listEl = document.getElementById('todo-list');
    this.countEl = document.getElementById('count');
    this.formEl = document.getElementById('new-todo-form');
    this.inputEl = document.getElementById('new-todo-input');
    this.items = this.store.load();
    this.filter = this.store.loadFilter();
    this.bindEvents();
    this.render();
  }
  bindEvents() {
    this.formEl.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = this.inputEl.value.trim();
      if (!title) return;
      const todo = { id: crypto.randomUUID(), title, completed: false, createdAt: Date.now() };
      this.items.unshift(todo);
      this.inputEl.value = '';
      this.persistAndRender();
    });
    document.querySelectorAll('.chip').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.filter = (btn.dataset.filter) ?? 'all';
        this.store.saveFilter(this.filter);
        this.render();
      });
      if ((btn.dataset.filter) === this.filter) {
        btn.classList.add('active');
      }
    });
    document.getElementById('toggle-all')?.addEventListener('click', () => {
      const allCompleted = this.items.every(i => i.completed);
      this.items = this.items.map(i => ({ ...i, completed: !allCompleted }));
      this.persistAndRender();
    });
    document.getElementById('clear-completed')?.addEventListener('click', () => {
      this.items = this.items.filter(i => !i.completed);
      this.persistAndRender();
    });
  }
  persistAndRender() {
    this.store.save(this.items);
    this.render();
  }
  render() {
    const view = this.items.filter(i => {
      if (this.filter === 'active') return !i.completed;
      if (this.filter === 'completed') return i.completed;
      return true;
    });
    this.listEl.innerHTML = '';
    for (const item of view) {
      const li = document.createElement('li');
      li.className = 'item' + (item.completed ? ' completed' : '');
      li.dataset.id = item.id;
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'checkbox';
      checkbox.checked = item.completed;
      checkbox.addEventListener('change', () => {
        this.toggle(item.id);
      });
      const title = document.createElement('p');
      title.className = 'title';
      title.textContent = item.title;
      title.title = 'Double‑click to edit';
      title.addEventListener('dblclick', () => this.editInline(li, item));
      const actions = document.createElement('div');
      actions.className = 'actions';
      const editBtn = document.createElement('button');
      editBtn.className = 'icon-btn';
      editBtn.setAttribute('aria-label', 'Edit');
      editBtn.textContent = '✏️';
      editBtn.addEventListener('click', () => this.editInline(li, item));
      const delBtn = document.createElement('button');
      delBtn.className = 'icon-btn';
      delBtn.setAttribute('aria-label', 'Delete');
      delBtn.textContent = '🗑️';
      delBtn.addEventListener('click', () => this.remove(item.id));
      actions.append(editBtn, delBtn);
      li.append(checkbox, title, actions);
      this.listEl.appendChild(li);
    }
    const remaining = this.items.filter(i => !i.completed).length;
    const total = this.items.length;
    this.countEl.textContent = `${remaining} of ${total} left`;
  }
  toggle(id) {
    this.items = this.items.map(i => i.id === id ? { ...i, completed: !i.completed } : i);
    this.persistAndRender();
  }
  remove(id) {
    this.items = this.items.filter(i => i.id != id);
    this.persistAndRender();
  }
  editInline(container, item) {
    const titleEl = container.querySelector('.title');
    const input = document.createElement('input');
    input.className = 'edit';
    input.value = item.title;
    titleEl.replaceWith(input);
    input.focus();
    input.selectionStart = input.value.length;
    const commit = () => {
      const val = input.value.trim();
      if (!val) {
        this.remove(item.id);
        return;
      }
      this.items = this.items.map(i => i.id === item.id ? { ...i, title: val } : i);
      this.persistAndRender();
    };
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') commit();
      if (e.key === 'Escape') this.render();
    });
    input.addEventListener('blur', commit);
  }
}
document.addEventListener('DOMContentLoaded', () => new TodoApp());
