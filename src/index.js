/* ДЗ 2 - работа с массивами и объектами */

/*
 Задание 1:

 Напишите аналог встроенного метода forEach для работы с массивами
 Посмотрите как работает forEach и повторите это поведение для массива, который будет передан в параметре array
 */
function forEach(array, fn) {
  for (let i = 0; i < array.length; i++) {
    fn(array[i], i, array);
  }
}

/*
 Задание 2:

 Напишите аналог встроенного метода map для работы с массивами
 Посмотрите как работает map и повторите это поведение для массива, который будет передан в параметре array
 */
function map(array, fn) {
  let array_copy = [];
  for (let i = 0; i < array.length; i++) {
    array_copy[i] = fn(array[i], i, array)
  }
  return array_copy;
}

/*
 Задание 3:

 Напишите аналог встроенного метода reduce для работы с массивами
 Посмотрите как работает reduce и повторите это поведение для массива, который будет передан в параметре array
 */
function reduce(array, fn, initial) {
  let [newInitial, i] = initial === undefined ? [array[0], 1] : [initial, 0];

  for (i; i < array.length; i++) {
    newInitial = fn(newInitial, array[i], i, array);
  }

  return newInitial;

}

/*
 Задание 4:

 Функция должна перебрать все свойства объекта, преобразовать их имена в верхний регистр и вернуть в виде массива

 Пример:
   upperProps({ name: 'Сергей', lastName: 'Петров' }) вернет ['NAME', 'LASTNAME']
 */
function upperProps(obj) {
  let array = [];
  for (let upp in obj) {
    array.push(upp.toUpperCase());
  }
  return array;
}

/*
 Задание 5 *:

 Напишите аналог встроенного метода slice для работы с массивами
 Посмотрите как работает slice и повторите это поведение для массива, который будет передан в параметре array
 */
function slice(array, from = 0, to = array.length) {
  const len = array.length;
  const result = [];

  if (from < 0 && Math.abs(from) > len) {
    from = -len;
  } else if (from >= 0 && from > len) {
    from = len;
  }

  if (to < 0 && Math.abs(to) > len) {
    to = -len;
  } else if (to > 0 && to > len) {
    to = len;
  }

  from = from >= 0 ? from : len + from;
  to = to < 0 ? to + len : to;

  for (let i = from; i < to; i++) {
    result.push(array[i]);
  }

  return result;
}

/*
 Задание 6 *:

 Функция принимает объект и должна вернуть Proxy для этого объекта
 Proxy должен перехватывать все попытки записи значений свойств и возводить это значение в квадрат
 */
function createProxy(obj) {
  const p = new Proxy(obj, {
    set: function (target, prop, value) {
      target[prop] = value * value;
      return true;
    }
  })

  return p;
}
export {
  forEach,
  map,
  reduce,
  upperProps,
  slice,
  createProxy
};
