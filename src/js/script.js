// Элементы DOM
const openDialogBtn = document.getElementById('openDialogBtn')
const taskDialog = document.getElementById('taskDialog')
const overlay = document.getElementById('overlay')
const taskForm = document.getElementById('taskForm')
const taskInput = document.getElementById('taskInput')
const tasksColumn = document.getElementById('tasks')
const inProgressColumn = document.getElementById('inProgressTasks')
const completedColumn = document.getElementById('completedTasks')

// Открытие модального окна
openDialogBtn.addEventListener('click', () => {
	taskDialog.showModal()
	overlay.style.display = 'block' // Включить затемнение
})

// Закрытие окна при нажатии на область вне окна
taskDialog.addEventListener('click', event => {
	const rect = taskDialog.getBoundingClientRect()
	const isInDialog =
		event.clientX >= rect.left &&
		event.clientX <= rect.right &&
		event.clientY >= rect.top &&
		event.clientY <= rect.bottom
	if (!isInDialog) {
		taskDialog.close()
		overlay.style.display = 'none' // Убрать затемнение
	}
})

// Закрытие модального окна при нажатии кнопки "Отменить"
document.getElementById('cancelBtn').addEventListener('click', () => {
	taskDialog.close()
	overlay.style.display = 'none' // Убрать затемнение
})

// Добавление новой задачи
taskForm.addEventListener('submit', event => {
	event.preventDefault() // Предотвратить перезагрузку страницы

	const taskName = taskInput.value.trim()
	if (taskName !== '') {
		const tasks = getTasksFromLocalStorage() // Получаем существующие задачи из localStorage
		const newTask = {
			name: taskName,
			inProgress: false,
			completed: false,
		}

		tasks.push(newTask) // Добавляем новую задачу в массив
		saveTasksToLocalStorage(tasks) // Сохраняем задачи в localStorage

		displayTasks(tasks) // Обновляем список задач на странице

		taskInput.value = '' // Очищаем поле ввода
		taskDialog.close()
		overlay.style.display = 'none' // Убираем затемнение фона
	} else {
		alert('Введите задачу!')
	}
})

// Функции для работы с задачами и отображением
function saveTasksToLocalStorage(tasks) {
	localStorage.setItem('tasks', JSON.stringify(tasks))
}

function getTasksFromLocalStorage() {
	const tasks = localStorage.getItem('tasks')
	return tasks ? JSON.parse(tasks) : []
}

function displayTasks(tasks) {
	tasksColumn.innerHTML = '' // Очищаем колонку задач
	inProgressColumn.innerHTML = '' // Очищаем колонку "В работе"
	completedColumn.innerHTML = '' // Очищаем колонку выполненных задач

	tasks.forEach((task, index) => {
		createTaskCard(task, index) // Создаем карточку для каждой задачи
	})
}

function createTaskCard(task, index) {
	const taskCard = document.createElement('div')
	taskCard.classList.add('task-card')
	taskCard.textContent = task.name

	const deleteBtn = document.createElement('button')
	deleteBtn.textContent = 'Удалить'
	deleteBtn.addEventListener('click', () => {
		const tasks = getTasksFromLocalStorage()
		tasks.splice(index, 1) // Удаляем задачу по индексу
		saveTasksToLocalStorage(tasks)
		displayTasks(tasks)
	})

	taskCard.appendChild(deleteBtn)
	taskCard.draggable = true // Делаем задачу перетаскиваемой
	taskCard.setAttribute('data-index', index)

	// Определяем, в какую колонку добавить задачу
	if (task.completed) {
		completedColumn.appendChild(taskCard)
	} else if (task.inProgress) {
		inProgressColumn.appendChild(taskCard)
	} else {
		tasksColumn.appendChild(taskCard)
	}

	// Добавляем обработчики для перетаскивания
	taskCard.addEventListener('dragstart', handleDragStart)
	taskCard.addEventListener('dragend', handleDragEnd)
}

// Перетаскивание задач
let draggedTaskIndex = null

function handleDragStart(event) {
	draggedTaskIndex = event.target.getAttribute('data-index')
	event.target.style.opacity = '0.5' // Задаем прозрачность перетаскиваемому элементу
}

function handleDragEnd(event) {
	event.target.style.opacity = '' // Возвращаем прозрачность
	draggedTaskIndex = null // Сбрасываем индекс перетаскиваемой задачи
}

// Разрешаем сброс задач в колонку
;[tasksColumn, inProgressColumn, completedColumn].forEach(column => {
	column.addEventListener('dragover', event => {
		event.preventDefault() // Разрешаем сброс
	})

	column.addEventListener('drop', event => {
		const tasks = getTasksFromLocalStorage()
		const task = tasks[draggedTaskIndex]

		// Определяем, в какую колонку перетащили задачу
		if (column.id === 'tasks') {
			task.inProgress = false
			task.completed = false
		} else if (column.id === 'inProgressTasks') {
			task.inProgress = true
			task.completed = false
		} else if (column.id === 'completedTasks') {
			task.inProgress = false
			task.completed = true
		}

		saveTasksToLocalStorage(tasks)
		displayTasks(tasks) // Обновляем отображение
	})
})

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
	const tasks = getTasksFromLocalStorage()
	displayTasks(tasks)
})
$(document).ready(function () {
	$('.menu-burger__header').click(function () {
		$('.menu-burger__header').toggleClass('open-menu')
		$('.header__nav').toggleClass('open-menu')
		$('body').toggleClass('fixed-page')
	})
})
