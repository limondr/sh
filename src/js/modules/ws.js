function createWS(url, payloads) {
    console.log(url);
    var socket = new WebSocket(url);

    socket.onmessage = function(event) {
        var message = JSON.parse(event.data);

        payloads[message.payload](message.data, socket);
    };

    socket.onerror = function(error) {
        alert("Ошибка " + error.message);
    };

    return socket;
}

export {
    createWS
};