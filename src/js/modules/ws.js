function createWS(url, payloads){
    console.log(url)
    var socket = new WebSocket(url);
      
    socket.onclose = function(event) {
        if (event.wasClean) {
            alert('Соединение закрыто чисто');
        } else {
            alert('Обрыв соединения');
        }

        alert('Код: ' + event.code + ' причина: ' + event.reason);
    };
      
    socket.onmessage = function(event) {
        var message = JSON.parse(event.data);

        payloads[message.payload](message.data, socket)
    };
      
    socket.onerror = function(error) {
        alert("Ошибка " + error.message);
    };

    return socket;
}

export {
    createWS
}