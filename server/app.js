const fs = require("fs");
const http = require("http");
const WebSocket = require("ws");
const db = require("./database");
assert = require("assert");
path = require("path");
multiparty = require("multiparty");

const server = http.createServer((req, res) => {});

const wss = new WebSocket.Server({
    server
});

const clients = {
    online: [
        /* { clientId: 'godvil' } */
    ],
    add: (clientId) => {
        console.log('adding client:', clientId)
        if (clientId && !clients.online.filter((el) => {
                return el.clientId === clientId
            }).length > 0) {
            clients.online = clients.online.concat({
                clientId: clientId
            })
        }
    },
    remove: (clientId) => {
        clients.online = clients.online.filter((el) => {
            return el.clientId !== clientId
        });
        wss.clients.forEach(client => {
            client.send(JSON.stringify({
                payload: 'refreshUsers',
                data: clients.getOnlineUsers()
            }))
        });
    },
    isOnline: (clientId) => {
        return clients.online.filter((el) => {
            return el.clientId === clientId
        }).length > 0;
    },
    getOnlineUsers: () => {
        let users = [];

        clients.online.forEach((user) => {
            users = users.concat(db.get('users')
                .find({
                    nickname: user.clientId
                })
                .value())
        });

        console.log('Sending online user list:');
        console.log(users);

        return users;
    },
}

function heartbeat(ws) {
    ws.isAlive = true;
}

server.on('request', (request, response) => {
    let op = request.url.match(/^\/(\S+?)(?:$|\/.*)/);

    response.setHeader('Access-Control-Allow-Origin', '*');

    console.log(op);

    if (!op) {
        response.end();
        return;
    }

    switch (op[1]) {
        case 'photos': {
            if (/^\/photos\//i.test(request.url)) {
                let photoName = request.url.match(/\/photos\/(\w+).*$/i);

                if (photoName) {
                    photoName = photoName[1];

                    if (/^\w+$/.test(photoName)) {
                        outPhoto(response, photoName);
                        return;
                    }
                }
            }

            outPhoto(response);
            return;
        }
        case 'upload': {
            if (request.method.toLowerCase() === 'post') {
                let form = new multiparty.Form();

                response.setHeader('Content-type', 'application/json; charset=utf8');

                form.parse(request, function(err, fields, files) {
                    let currentFile = files.photo && files.photo[0],
                        maxSize = 512 * 1024;

                    try {
                        assert.equal(currentFile !== undefined, true, 'File not specified');
                        assert.equal(/^\.jpe?g$/i.test(path.extname(currentFile.path)), true, 'Only jpg is allowed');
                        assert.equal(currentFile.size <= maxSize, true, `Max file size is ${maxSize}kb`);

                        let user = db.get('users').find({
                                nickname: fields.nickname[0]
                            }).value(),
                            file = files.photo[0];

                        if (!user) {
                            throw new Error('User not found');
                        }

                        fs.writeFileSync(path.join(__dirname, `photos/${user.nickname}.jpg`), fs.readFileSync(file.path));
                        db.get('users').find({
                            nickname: user.nickname
                        }).assign({
                            avatar: `photos/${user.nickname}.jpg`
                        }).write();
                        console.log(`Photo of ${user.nickname} was loaded`);

                        wss.clients.forEach(client => {
                            client.send(JSON.stringify({
                                payload: 'getMessages',
                                data: {
                                    messages: db.get('messages').value()
                                }
                            }));
                            client.send(JSON.stringify({
                                payload: 'refreshUsers',
                                data: clients.getOnlineUsers()
                            }));
                        });

                        response.end(JSON.stringify({
                            ok: true
                        }));
                    } catch (e) {
                        console.log(e.message)
                        response.end(JSON.stringify({
                            error: {
                                message: e.message
                            }
                        }));
                    }
                });
            }
            break;
        }
        default:
            response.end();
    }
});

var payloads = {
    'newMessage': (data, ws) => {
        data.message.dateString = getDateString();
        data.message.timestamp = Date.now();

        db.get('messages').push(data.message).write();
        db.get('users').find({
            nickname: data.message.nickname
        }).assign({
            last_message: data.message.text
        }).write();

        wss.clients.forEach(client => {
            client.send(JSON.stringify({
                payload: 'newMessage',
                data: data
            }));
            client.send(JSON.stringify({
                payload: 'refreshUsers',
                data: clients.getOnlineUsers()
            }));
        });
    },
    'newAuth': (data, ws) => {
        ws.clientId = data.user.nickname;
        clients.add(data.user.nickname);
        if (db.get('users').find({
                nickname: data.user.nickname
            }).value() === undefined) {
            db.get('users').push(data.user).write();
        } else {
            db.get('users').find({
                nickname: data.user.nickname
            }).assign(data.user).write();
        }

        wss.clients.forEach(client => {
            client.send(JSON.stringify({
                payload: 'refreshUsers',
                data: clients.getOnlineUsers()
            }))
        });
    },
    'pong': (data, ws) => {
        console.log(`Pong from: ${ws.clientId || 'not yet defined'}`);
        heartbeat(ws);
    }
}

wss.on('connection', function connection(ws) {
    ws.isAlive = true;
    ws.send(JSON.stringify({
        payload: 'getMessages',
        data: {
            messages: db.get('messages').value()
        }
    }));
    ws.on('message', function incoming(message) {
        var mes = JSON.parse(message);

        payloads[mes.payload](mes.data, ws);
    });
});

wss.on('close', function close(ws) {
    console.log(`Client disconnected, ID: ${ws.clientId || 'not yet defined'}`);
    if (ws.clientId) clients.remove(ws.clientId);
});

// Регулярный пинг всех клиентов
const interval = setInterval(function ping() {
    currentClients = [];
    wss.clients.forEach(function each(ws) {
        if (ws.clientId) currentClients = currentClients.concat(ws.clientId);
        if (ws.clientId && !clients.isOnline(ws.clientId)) clients.add(ws.clientId);

        if (ws.isAlive === false) {
            console.log(`Terminating client, ID: ${ws.clientId || 'not yet defined'}`);
            if (ws.clientId) clients.remove(ws.clientId);
            return ws.terminate();
        }

        ws.isAlive = false;
        console.log(`Ping to: ${ws.clientId || 'not yet defined'}`)
        ws.send(JSON.stringify({
            payload: 'ping',
            data: {}
        }));
    });
    clients.online.forEach((el) => {
        if (!currentClients.includes(el.clientId)) clients.remove(el.clientId);
    });
    console.log(`Clients online: ${JSON.stringify(clients.online)}`);
}, 1000);

let outPhoto = (response, photoName) => {
    let fName = path.join(__dirname, 'photos', `${photoName}.jpg`),
        notFoundName = path.join(__dirname, 'static', 'no_avatar.jpg');

    response.setHeader('Content-type', 'image/jpg');

    if (fName && fs.existsSync(fName)) {
        response.end(fs.readFileSync(fName));
    } else {
        response.end(fs.readFileSync(notFoundName));
    }
};

let getDateString = () => {
    let date = new Date();

    let day = ("0" + date.getDate()).slice(-2);
    let month = ("0" + (date.getMonth() + 1)).slice(-2);
    let year = date.getFullYear();
    let hours = date.getHours();
    let minutes = date.getMinutes();

    hours < 10 ? hours = "0" + hours : '';
    minutes < 10 ? minutes = "0" + minutes : '';

    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

server.listen(8081, () => {
    console.log('Server is running on port 8081')
});