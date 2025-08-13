// app.ts — To‑Do app with localStorage persistence
type Filter = 'all' | 'active' | 'completed';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

class Store {
  private key = 'todo-ts-items';
  private filterKey = 'todo-ts-filter';

  load(): Todo[] {
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? JSON.parse(raw) as Todo[] : [];
    } catch {
      return [];
    }
  }

  save(items: Todo[]) {
    localStorage.setItem(this.key, JSON.stringify(items));
  }

  loadFilter(): Filter {
    const f = localStorage.getItem(this.filterKey) as Filter | null;
    return f ?? 'all';
  }

  saveFilter(f: Filter) {
    localStorage.setItem(this.filterKey, f);
  }
}

class TodoApp {
  private items: Todo[] = [];
  private filter: Filter = 'all';
  private store = new Store();

  private listEl = document.getElementById('todo-list') as HTMLUListElement;
  private countEl = document.getElementById('count') as HTMLSpanElement;
  private formEl = document.getElementById('new-todo-form') as HTMLFormElement;
  private inputEl = document.getElementById('new-todo-input') as HTMLInputElement;

  constructor() {
    this.items = this.store.load();
    this.filter = this.store.loadFilter();
    this.bindEvents();
    this.render();
  }

  private bindEvents() {
    // Add item
    this.formEl.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = this.inputEl.value.trim();
      if (!title) return;
      const todo: Todo = { id: crypto.randomUUID(), title, completed: false, createdAt: Date.now() };
      this.items.unshift(todo);
      this.inputEl.value = '';
      this.persistAndRender();
    });

    // Filters
    document.querySelectorAll<HTMLButtonElement>('.chip').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.filter = (btn.dataset.filter as Filter) ?? 'all';
        this.store.saveFilter(this.filter);
        this.render();
      });
      // set active state from stored filter
      if ((btn.dataset.filter as Filter) === this.filter) {
        btn.classList.add('active');
      }
    });

    // Bulk actions
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

  private persistAndRender() {
    this.store.save(this.items);
    this.render();
  }

  private render() {
    // Filtered view
    const view = this.items.filter(i => {
      if (this.filter === 'active') return !i.completed;
      if (this.filter === 'completed') return i.completed;
      return true;
    });

    // Clear list
    this.listEl.innerHTML = '';

    // Render each item
    for (const item of view) {
      const li = document.createElement('li');
      li.className = 'item' + (item.completed ? ' completed' : '');
      li.dataset.id = item.id;

      // Checkbox
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'checkbox';
      checkbox.checked = item.completed;
      checkbox.addEventListener('change', () => {
        this.toggle(item.id);
      });

      // Title / editable
      const title = document.createElement('p');
      title.className = 'title';
      title.textContent = item.title;
      title.title = 'Double‑click to edit';
      title.addEventListener('dblclick', () => this.editInline(li, item));

      // Actions
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

    // Count
    const remaining = this.items.filter(i => !i.completed).length;
    const total = this.items.length;
    this.countEl.textContent = `${remaining} of ${total} left`;
  }

  private toggle(id: string) {
    this.items = this.items.map(i => i.id === id ? { ...i, completed: !i.completed } : i);
    this.persistAndRender();
  }

  private remove(id: string) {
    this.items = this.items.filter(i => i.id != id);
    this.persistAndRender();
  }

  private editInline(container: HTMLLIElement, item: Todo) {
    // Replace title with an input
    const titleEl = container.querySelector('.title') as HTMLElement;
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

// Boot
document.addEventListener('DOMContentLoaded', () => new TodoApp());
