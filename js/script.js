// Constante do banco de dados
const dbName = 'myTaskDB';
// Versão do banco de dados
const dbVersion = 1;
// Nome da store
const storeName = 'tasks';

// ABrir banco de dados
function openDB() {
    return new Promise((resolve, reject) => {
        let request = window.indexedDB.open(dbName, dbVersion);
        
        request.onerror = function(event) {
            console.error("Erro ao abrir o banco de dados:", event.target.errorCode);
            reject(event.target.errorCode);
        };
        
        request.onsuccess = function(event) {
            let db = event.target.result;
            console.log("Banco de dados aberto com sucesso!");
            resolve(db);
        };

        request.onupgradeneeded = function(event) {
            let db = event.target.result;
            // Criar a store se n tiver uma
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName, { keyPath: 'id', autoIncrement:true });
            }
        };
    });
}

// Adicionar tarefa
async function addTask(taskName) {
    try {
        let db = await openDB();
        let transaction = db.transaction([storeName], 'readwrite');
        let store = transaction.objectStore(storeName);
        store.add({ name: taskName });

        await new Promise((resolve) => {
            transaction.oncomplete = resolve;
        });

        console.log('Tarefa adicionada com sucesso!');
        return true;
    } catch (error) {
        console.error('Erro ao adicionar tarefa:', error);
        return false;
    }
}

// Tirar a tarefa
async function removeTask(taskId) {
    try {
        let db = await openDB();
        let transaction = db.transaction([storeName], 'readwrite');
        let store = transaction.objectStore(storeName);
        store.delete(taskId);

        await new Promise((resolve) => {
            transaction.oncomplete = resolve;
        });

        console.log('Tarefa removida com sucesso!');
        return true;
    } catch (error) {
        console.error('Erro ao remover tarefa:', error);
        return false;
    }
}

// Mostrar as tarefas
async function getAllTasks() {
    try {
        let db = await openDB();
        let transaction = db.transaction([storeName], 'readonly');
        let store = transaction.objectStore(storeName);
        let request = store.getAll();

        return new Promise((resolve, reject) => {
            request.onsuccess = function(event) {
                resolve(event.target.result);
            };
            request.onerror = function(event) {
                console.error('Erro ao obter todas as tarefas:', event.target.error);
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error('Erro ao obter todas as tarefas:', error);
        return [];
    }
}

// Mudar a função newTask para usar o IndexedDB
async function newTask() {
    let input = document.getElementById('input-new-task');
    input.style.border = '';

    if (!input.value) {
        input.style.border = '1px solid red';
        alert('Digite algo para inserir em sua lista');
    } else {
        // Adiciona a tarefa no IndexedDB
        if (await addTask(input.value)) {
            // Atualiza a exibição das tarefas
            showValues();
        } else {
            alert('Erro ao adicionar a tarefa. Tente novamente mais tarde.');
        }
    }
    input.value = '';
}

// Modifique a função showValues para utilizar o IndexedDB
async function showValues() {
    let tasks = await getAllTasks();
    let list = document.getElementById('to-do-list');
    list.innerHTML = '';
    
    tasks.forEach(task => {
        list.innerHTML += `<li>${task.name}<button id='btn-ok' onclick='removeItem(${task.id})'><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-lg" viewBox="0 0 16 16"><path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/></svg></button></li>`;
    });
}

// Modifique a função removeItem para utilizar o IndexedDB
async function removeItem(taskId) {
    // Remove a tarefa do IndexedDB
    if (await removeTask(taskId)) {
        // Atualiza a exibição das tarefas
        showValues();
    } else {
        alert('Erro ao remover a tarefa. Tente novamente mais tarde.');
    }
}

// Chame a função showValues para exibir as tarefas ao carregar a página
showValues();
