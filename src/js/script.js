// Элементы DOM для задач
const openDialogBtn = document.getElementById('openDialogBtn')
const taskDialog = document.getElementById('taskDialog')
const overlay = document.getElementById('overlay')
const taskForm = document.getElementById('taskForm')
const taskInput = document.getElementById('taskInput')
const tasksColumn = document.getElementById('tasks')
const inProgressColumn = document.getElementById('inProgressTasks')
const completedColumn = document.getElementById('completedTasks')

// Элементы DOM для истории
const showHistoryBtn = document.getElementById('show-history')
const historyModal = document.getElementById('history-modal')
const historyList = document.getElementById('history-list')
const closeHistoryBtn = document.getElementById('close-history')
const clearHistoryBtn = document.getElementById('clear-history')

// Глобальная переменная для истории
const globalHistory = JSON.parse(localStorage.getItem('history')) || []

// Открытие модального окна для добавления задачи
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

		// Логируем добавление задачи
		logHistory(`Добавлена задача: "${newTask.name}"`)

		taskInput.value = '' // Очищаем поле ввода
		taskDialog.close()
		overlay.style.display = 'none' // Убираем затемнение
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
		const deletedTask = tasks.splice(index, 1)[0] // Удаляем задачу по индексу и сохраняем её

		saveTasksToLocalStorage(tasks)
		displayTasks(tasks)

		// Логируем удаление задачи, чтобы была возможность восстановления
		logHistory(`Удалена задача: "${deletedTask.name}"`, deletedTask)
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
		const previousColumn = task.inProgress
			? 'inProgress'
			: task.completed
			? 'completed'
			: 'tasks'

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

		// Логируем перемещение задачи
		logHistory(
			`Задача "${task.name}" перемещена в колонку "${column.id.replace(
				'Tasks',
				''
			)}"`
		)
	})
})

// Функции для работы с историей

function logHistory(message, task = null) {
	if (task) {
		globalHistory.push({ message, task })
	} else {
		globalHistory.push({ message }) // Логируем сообщение без задачи
	}
	saveHistory() // Сохраняем историю в localStorage
}

function saveHistory() {
	localStorage.setItem('history', JSON.stringify(globalHistory))
}

function showHistory() {
	historyList.innerHTML = '' // Очищаем список истории

	globalHistory.forEach(entry => {
		const li = document.createElement('li')
		li.textContent = entry.message

		if (entry.task) {
			const restoreButton = document.createElement('button')
			restoreButton.textContent = 'Восстановить'
			restoreButton.onclick = () => restoreTask(entry.task, entry) // Восстановление задачи
			li.appendChild(restoreButton)
		}

		historyList.appendChild(li)
	})

	// Показываем модальное окно с историей
	historyModal.style.display = 'block'
	overlay.style.display = 'block' // Показываем затемнение
}

// Функция для восстановления задачи
// Функция для восстановления задачи
function restoreTask(task, entry) {
	const tasks = getTasksFromLocalStorage()
	tasks.push(task) // Восстанавливаем задачу
	saveTasksToLocalStorage(tasks)
	displayTasks(tasks)

	// Убираем запись о восстановленной задаче из истории
	const historyIndex = globalHistory.indexOf(entry)
	if (historyIndex > -1) {
		globalHistory.splice(historyIndex, 1) // Удаляем запись о восстановленной задаче
		saveHistory() // Обновляем историю
	}

	// Добавляем новую запись о восстановлении задачи
	logHistory(`Задача "${task.name}" была восстановлена`)

	// Обновляем отображение истории
	showHistory()
}

// Очистка истории
clearHistoryBtn.onclick = function () {
	globalHistory.length = 0 // Очищаем историю
	saveHistory() // Сохраняем пустую историю в localStorage
	showHistory() // Обновляем отображение истории
}

// Закрытие модального окна истории
closeHistoryBtn.onclick = function () {
	historyModal.style.display = 'none'
	overlay.style.display = 'none'
}

// Открытие модального окна истории
showHistoryBtn.onclick = showHistory
$(document).ready(function () {
	$('.menu-burger__header').click(function () {
		$('.menu-burger__header').toggleClass('open-menu')
		$('.header__nav').toggleClass('open-menu')
		$('body').toggleClass('fixed-page')
	})
})
// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
	const tasks = getTasksFromLocalStorage()
	displayTasks(tasks)
})
