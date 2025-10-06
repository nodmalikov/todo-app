'use strict'

window.addEventListener('DOMContentLoaded', () => {
	tailwind.config = {
		darkMode: 'class',
		theme: {
			extend: {
				colors: {
					primary: '#facc15',
				},
			},
		},
	}

	// --- Elementlar ---
	const todoInput = document.getElementById('todoInput')
	const addBtn = document.getElementById('addBtn')
	const todoList = document.getElementById('todoList')
	const todoFooter = document.getElementById('todoFooter')
	const filterBtns = document.querySelectorAll('.filter-btn')
	const loaderWrapper = document.querySelector('.loader-wrapper')
	const themeToggle = document.getElementById('themeToggle')
	const html = document.documentElement

	// --- Global o'zgaruvchilar ---
	let todos = []

	// --- 2. Theme ---
	function loadTheme() {
		if (localStorage.theme === 'dark') {
			html.classList.add('dark')
			themeToggle.textContent = '☀️'
		} else {
			html.classList.remove('dark')
			themeToggle.textContent = '🌙'
		}
	}

	function toggleTheme() {
		html.classList.toggle('dark')
		const isDark = html.classList.contains('dark')
		themeToggle.textContent = isDark ? '☀️' : '🌙'
		localStorage.theme = isDark ? 'dark' : 'light'
	}

	themeToggle.addEventListener('click', toggleTheme)
	loadTheme()

	// --- 3. Local Storage ---
	function saveToLocalStorage() {
		localStorage.setItem('todos', JSON.stringify(todos))
	}

	function getFromLocalStorage() {
		const data = localStorage.getItem('todos')
		todos = data ? JSON.parse(data) : []
	}

	// --- 4. Todo qo‘shish ---
	function addTodo() {
		const text = todoInput.value.trim()
		if (!text) return

		const newTodo = {
			id: Date.now(),
			text: text,
			completed: false,
		}

		todos.push(newTodo)
		saveToLocalStorage()
		renderTodos()
		todoInput.value = ''
	}

	addBtn.addEventListener('click', addTodo)

	todoInput.addEventListener('keyup', e => {
		if (e.key === 'Enter') addTodo()
	})

	// --- 5. Todo render ---
	function renderTodos(filter = 'all') {
		todoList.innerHTML = ''

		let filteredTodos = todos

		if (filter === 'active') {
			filteredTodos = todos.filter(t => !t.completed)
		}

		if (filter === 'completed') {
			filteredTodos = todos.filter(t => t.completed)
		}

		filteredTodos.forEach(todo => {
			const li = document.createElement('li')
			li.className =
				'flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-3 rounded-lg'

			const left = document.createElement('div')
			left.className = 'flex items-center gap-2 grow'

			const checkbox = document.createElement('input')
			checkbox.type = 'checkbox'
			checkbox.checked = todo.completed
			checkbox.className = 'cursor-pointer'
			checkbox.addEventListener('change', () => toggleComplete(todo.id))

			const span = document.createElement('span')
			span.textContent = todo.text
			span.className = todo.completed
				? 'line-through text-gray-500 dark:text-gray-400'
				: 'text-gray-800 dark:text-gray-100'

			left.append(checkbox)
			left.append(span)

			const right = document.createElement('div')
			right.className = 'flex items-center gap-2'

			const editBtn = document.createElement('button')
			editBtn.textContent = '✏️'
			editBtn.className = 'hover:opacity-80'
			editBtn.addEventListener('click', () => editTodo(todo.id, span))

			const deleteBtn = document.createElement('button')
			deleteBtn.textContent = '🗑️'
			deleteBtn.className = 'hover:opacity-80'
			deleteBtn.addEventListener('click', () => deleteTodo(todo.id))

			right.append(editBtn)
			right.append(deleteBtn)

			li.append(left)
			li.append(right)

			todoList.appendChild(li)
		})

		todoFooter.textContent = `${todos.length} ta ish`
	}

	// --- 6. Delete ---
	function deleteTodo(id) {
		todos = todos.filter(todo => todo.id !== id)
		saveToLocalStorage()
		renderTodos()
	}

	// --- 7. Complete status ---
	function toggleComplete(id) {
		todos = todos.map(todo => {
			if (todo.id === id) {
				return { ...todo, completed: !todo.completed }
			}
			return todo
		})

		saveToLocalStorage()
		renderTodos()
	}

	// --- 8. Edit ---
	function editTodo(id, spanEl) {
		const input = document.createElement('input')
		input.type = 'text'
		input.value = spanEl.textContent
		input.className =
			'block w-[80%] bg-transparent focus:outline-none dark:text-gray-100'

		spanEl.replaceWith(input)
		input.focus()

		input.addEventListener('blur', () => saveEdit(id, input))
		input.addEventListener('keyup', e => {
			if (e.key === 'Enter') saveEdit(id, input)
		})
	}

	function saveEdit(id, inputEl) {
		const newText = inputEl.value.trim()
		if (!newText) return

		todos = todos.map(todo => {
			if (todo.id === id) {
				return { ...todo, text: newText }
			}
			return todo
		})

		saveToLocalStorage()
		renderTodos()
	}

	// --- 9. Filter ---
	filterBtns.forEach(btn => {
		btn.addEventListener('click', () => {
			filterBtns.forEach(b => b.classList.remove('filter-btn-active'))
			btn.classList.add('filter-btn-active')
			const filter = btn.dataset.filter
			renderTodos(filter)
		})
	})

	// --- 10. Boshlang‘ich yuklash ---
	getFromLocalStorage()
	renderTodos()

	// --- 11. Loader ---
	window.addEventListener('load', () => {
		setTimeout(() => {
			loaderWrapper.classList.add('hidden')
		}, 800)
	})
})
