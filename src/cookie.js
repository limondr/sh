/*
 ДЗ 7 - Создать редактор cookie с возможностью фильтрации

 7.1: На странице должна быть таблица со списком имеющихся cookie. Таблица должна иметь следующие столбцы:
   - имя
   - значение
   - удалить (при нажатии на кнопку, выбранная cookie удаляется из браузера и таблицы)

 7.2: На странице должна быть форма для добавления новой cookie. Форма должна содержать следующие поля:
   - имя
   - значение
   - добавить (при нажатии на кнопку, в браузер и таблицу добавляется новая cookie с указанным именем и значением)

 Если добавляется cookie с именем уже существующей cookie, то ее значение в браузере и таблице должно быть обновлено

 7.3: На странице должно быть текстовое поле для фильтрации cookie
 В таблице должны быть только те cookie, в имени или значении которых, хотя бы частично, есть введенное значение
 Если в поле фильтра пусто, то должны выводиться все доступные cookie
 Если добавляемая cookie не соответсвует фильтру, то она должна быть добавлена только в браузер, но не в таблицу
 Если добавляется cookie, с именем уже существующей cookie и ее новое значение не соответствует фильтру,
 то ее значение должно быть обновлено в браузере, а из таблицы cookie должна быть удалена

 Запрещено использовать сторонние библиотеки. Разрешено пользоваться только тем, что встроено в браузер
 */

/*
 homeworkContainer - это контейнер для всех ваших домашних заданий
 Если вы создаете новые html-элементы и добавляете их на страницу, то добавляйте их только в этот контейнер

 Пример:
   const newDiv = document.createElement('div');
   homeworkContainer.appendChild(newDiv);
 */
const homeworkContainer = document.querySelector('#homework-container');
// текстовое поле для фильтрации cookie
const filterNameInput = homeworkContainer.querySelector('#filter-name-input');
// текстовое поле с именем cookie
const addNameInput = homeworkContainer.querySelector('#add-name-input');
// текстовое поле со значением cookie
const addValueInput = homeworkContainer.querySelector('#add-value-input');
// кнопка "добавить cookie"
const addButton = homeworkContainer.querySelector('#add-button');
// таблица со списком cookie
const listTable = homeworkContainer.querySelector('#list-table tbody');

window.addEventListener('load', () => {
    let cookie = getCookie();

    iterrateCookieObj(cookie);
});

function getCookie() {
    if (!document.cookie) {
        return; 
    }

    const cookieAll = document.cookie.split('; ');
    const cookieObj = cookieAll.reduce((prev, current) => {
        let [name, value] = current.split('=');

        prev[name] = value;
    
        return prev;
    }, {});

    return cookieObj;
}

function iterrateCookieObj(cookieObj) {
    if (!cookieObj) {
        return; 
    }

    listTable.innerHTML = '';
    for (const key in cookieObj) {
        if (cookieObj.hasOwnProperty(key)) {
            createTR(key, cookieObj[key]);
        }
    }
}

function isMatching(full, chunk) {
    return full.includes(chunk);
}

function createTR(name, value) {
    let tr = document.createElement('tr');

    tr.innerHTML = '<td>' + name + '</td><td>' + value + '</td><td><button>Удалить</button></td>';
    listTable.appendChild(tr);
}

filterNameInput.addEventListener('keyup', filter);

function filter() {
    let filterGetCookie = getCookie();
    let value = filterNameInput.value;

    for (const key in filterGetCookie) {
        if (filterGetCookie.hasOwnProperty(key)) {
            if (!isMatching(filterGetCookie[key], value) && !isMatching(key, value)) {
                delete filterGetCookie[key];
            }
        }
    }
    iterrateCookieObj(filterGetCookie);

}

addButton.addEventListener('click', () => {
    // здесь можно обработать нажатие на кнопку "добавить cookie"
    document.cookie = `${addNameInput.value}=${addValueInput.value}`;
    filter();
});

listTable.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        let tr = e.target.closest('tr');
        let deletedCookie = tr.children[0].textContent;
        let date = new Date(0);

        document.cookie = `${deletedCookie}=; expires=${date.toUTCString()}`;
        tr.remove();
    }
})