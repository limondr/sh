/*
 Страница должна предварительно загрузить список городов из
 https://raw.githubusercontent.com/smelukov/citiesTest/master/cities.json
 и отсортировать в алфавитном порядке.

 При вводе в текстовое поле, под ним должен появляться список тех городов,
 в названии которых, хотя бы частично, есть введенное значение.
 Регистр символов учитываться не должен, то есть "Moscow" и "moscow" - одинаковые названия.

 Во время загрузки городов, на странице должна быть надпись "Загрузка..."
 После окончания загрузки городов, надпись исчезает и появляется текстовое поле.

 Разметку смотрите в файле towns-content.hbs

 Запрещено использовать сторонние библиотеки. Разрешено пользоваться только тем, что встроено в браузер

 *** Часть со звездочкой ***
 Если загрузка городов не удалась (например, отключился интернет или сервер вернул ошибку),
 то необходимо показать надпись "Не удалось загрузить города" и кнопку "Повторить".
 При клике на кнопку, процесс загрузки повторяется заново
 */

/*
 homeworkContainer - это контейнер для всех ваших домашних заданий
 Если вы создаете новые html-элементы и добавляете их на страницу, то добавляйте их только в этот контейнер

 Пример:
   const newDiv = document.createElement('div');
   homeworkContainer.appendChild(newDiv);
 */
const homeworkContainer = document.querySelector('#homework-container');

/*
 Функция должна вернуть Promise, который должен быть разрешен с массивом городов в качестве значения

 Массив городов пожно получить отправив асинхронный запрос по адресу
 https://raw.githubusercontent.com/smelukov/citiesTest/master/cities.json
 */
function loadTowns() {
    return new Promise(function(resolve, reject) {
        var xml = new XMLHttpRequest();
        let url = 'https://raw.githubusercontent.com/smelukov/citiesTest/master/cities.json';

        xml.open('GET', url, true);
        xml.responseType = 'json';
        xml.addEventListener('load', function() {

            var xmlresp = xml.response;

            xmlresp.sort(function(a, b) {
                if (a.name > b.name) {
                    return 1
                } 
                if (a.name < b.name) {
                    return -1
                }
            
                return 0;
            
            });
            resolve(xmlresp);
        });
        xml.onerror = function () {
            reject(xml.response);
        };
        xml.send();

    })
}

/*
 Функция должна проверять встречается ли подстрока chunk в строке full
 Проверка должна происходить без учета регистра символов

 Пример:
   isMatching('Moscow', 'moscow') // true
   isMatching('Moscow', 'mosc') // true
   isMatching('Moscow', 'cow') // true
   isMatching('Moscow', 'SCO') // true
   isMatching('Moscow', 'Moscov') // false
 */
function isMatching(full, chunk) {
    return full.toUpperCase().includes(chunk.toUpperCase());
}

/* Блок с надписью "Загрузка" */
const loadingBlock = homeworkContainer.querySelector('#loading-block');
/* Блок с текстовым полем и результатом поиска */
const filterBlock = homeworkContainer.querySelector('#filter-block');
/* Текстовое поле для поиска по городам */
const filterInput = homeworkContainer.querySelector('#filter-input');
/* Блок с результатами поиска */
const filterResult = homeworkContainer.querySelector('#filter-result');

let townList;

window.addEventListener('load', () => {
    initTowns();
});

function initTowns() {
    loadingBlock.style.display = 'block';
    filterResult.innerHTML = '';

    loadTowns().then(towns => {
        loadingBlock.style.display = 'none';
        filterInput.style.display = 'block';
        filterBlock.style.display = 'block'; 
        townList = towns;
    })
        .catch(() => {
            loadingBlock.style.display = 'none';
            filterInput.style.display = 'none';
            filterBlock.style.display = 'block';

            const div = document.createElement('div');
            const button = document.createElement('button');

            div.textContent = 'Не удалось загрузить города';
            button.textContent = 'Повторить';
            function buttonEvent() {
                initTowns();
                button.removeEventListener('click', buttonEvent);
            }
            button.addEventListener('click', buttonEvent);
            filterResult.appendChild(div);
            filterResult.appendChild(button);
        })
}

function createTownNode(town) {
    const div = document.createElement('div');

    div.textContent = `${town.name}`;

    return div;
}

function filterTowns(chunk) {
    filterResult.innerHTML = '';
    for (const town of townList) {
        if (isMatching(town.name, chunk)) {
            const townNode = createTownNode(town);

            filterResult.appendChild(townNode);
        }
    }

    if (!chunk) {
        filterResult.innerHTML = '';
    }
}

filterInput.addEventListener('keyup', function() {
    // это обработчик нажатия клавиш в текстовом поле
    filterTowns(event.target.value);
});

export {
    loadTowns,
    isMatching
};
