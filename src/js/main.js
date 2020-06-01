import '../sass/main.scss';
import '../font/ubuntu.css'
import {createWS} from './modules/ws';
import templateUserList from '../templates/userList.hbs'
import templateMessages from '../templates/messages.hbs'

var container = document.querySelector('.chat_right');
var imgBtn = document.querySelector('.left_img');
var imgBtn_save = document.querySelector('.save_btn');
var imgBtn_cancel = document.querySelector('.btn_nein')
var auth_btn = document.querySelector('.auth_btn');
var auth_name = document.querySelector('#auth_name');
var auth_nickname = document.querySelector('#auth_nickname');
var userlist = document.querySelector('.userlist');
var avatarUpload = document.querySelector('.upload_image');
var avatarUploadFile = '';

window.onload = function() {
  auth_btn.addEventListener("click", () => {
    if (auth_name.value !== "" && auth_nickname.value !== "") {
      chat._name = auth_name.value;
      chat._nickname = auth_nickname.value;

      chat.connect(auth_name.value, auth_nickname.value)
        document.querySelector(".auth").classList.add("hide");
        document.querySelector(".chat_main").classList.remove("hide");
        document.querySelector(".username").innerHTML = chat._name;
    }

    auth_name.value = "";
    auth_nickname.value = "";
  });

  imgBtn.addEventListener("click", () => {
    document.querySelector(".add_img_profile").classList.remove("hide");
  });

  imgBtn_cancel.addEventListener("click", () => {
    document.querySelector(".add_img_profile").classList.add("hide");
  });

  imgBtn_save.addEventListener("click", () => {
    document.querySelector(".add_img_profile").classList.add("hide");
    if (avatarUploadFile !== '') {
        var xhr = new XMLHttpRequest();

        xhr.onload = () => {
            console.log(xhr.response);
        };

		xhr.open('POST', 'http://localhost:8081/upload', true);

		let newImage = new FormData();
		newImage.append('photo', avatarUploadFile);
		newImage.append('nickname', chat._nickname);
		xhr.send(newImage);

		xhr.onreadystatechange = function() {
		  if (xhr.readyState != 4) { return };

		  if (xhr.status != 200) {
	  		alert("Ошибка загрузки фотографии");
		  } else {
            document.querySelector(".add_img_profile").classList.add("hide");
		  }

		}
    }
  });

  avatarUpload.addEventListener(
    "dragover",
    function(e) {
      e.stopPropagation();
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    },
    false
  );

  avatarUpload.addEventListener(
    "drop",
    function(e) {
      e.stopPropagation();
      e.preventDefault();

      var file = e.dataTransfer.files[0];

      if (!file) {
        return;
      }

      if (file["type"] != "image/jpeg") {
        return;
      }

      var filesize = file["size"] / 1024;

      if (filesize > 512) {
        return;
      }

      avatarUploadFile = file;
      var fileReader = new FileReader();
      fileReader.readAsDataURL(file);

      fileReader.addEventListener("load", function() {
        document.querySelector('img.size_photo').src = this.result;
      });
    },
    false
  );
};

const chat = {
    _name: '',
    _nickname: '',
    _url: 'ws://localhost:8081',
    _ws: {},
    auth: (name, nickname) => {
        chat._ws.send(JSON.stringify({
            payload: 'newAuth',
            data: {
                user: {
                    name: name,
                    nickname: nickname
                }
            }
        }));
    },
    sendMessage: (text) => {
        chat._ws.send(JSON.stringify({
            payload: 'newMessage',
            data: {
                message: {
                    nickname: chat._nickname,
                    text: text
                }
            }
        }));
    },
    connect: (name, nickname) => {
        chat._ws = createWS(chat._url, {
            'newMessage': (data, ws) => {
                container.innerHTML = templateMessages(
                    {
                        text: data.message.text,
                        timestamp: data.message.dateString.slice(data.message.dateString.lastIndexOf(' '), data.message.dateString.length),
                        self: data.message.nickname === chat._nickname,
                        avatar_url: `http://localhost:8081/photos/${data.message.nickname}?${Date.now()}`
                    }
                ) + container.innerHTML;
            },
            'getMessages': (data, ws) => {
                container.innerHTML = '';
               data.messages.forEach(message => {
                container.innerHTML = templateMessages(
                    {
                        text: message.text,
                        timestamp: message.dateString.slice(message.dateString.lastIndexOf(' '), message.dateString.length),
                        self: message.nickname === chat._nickname,
                        avatar_url: `http://localhost:8081/photos/${message.nickname}?${Date.now()}`
                    }
                ) + container.innerHTML;
               });
            },
            'newUser': (data, ws) => {
                console.log('newUser: ', data);
             },
             'refreshUsers': (data, ws) => {
                console.log('refreshUsers: ', data);
                userlist.innerHTML = '';
                data.forEach(user => {
                    userlist.innerHTML += templateUserList({name: user.name, last_message: user.last_message, avatar_url: `http://localhost:8081/photos/${user.nickname}?${Date.now()}`});
                });
                document.querySelector('#user_num').innerHTML = `${data.length} ${
                    data.length === 1 || data.length%10 === 1 && data.length%100 !== 11 ?
                     'участник' : 
                    data.length%10 === 0 || data.length%10 >= 5 || data.length%100 === 11 ?
                      'участников' : 
                      'участника'
                }`;
                
				let userProfileImg = 'http://localhost:8081/photos/'+chat._nickname+"?"+Date.now();
				document.querySelector('.left_img').style.background = `url('${userProfileImg}')`;
             }
        });

        chat._ws.onopen = function() {
            console.log("Соединение установлено.");
            chat.auth(chat._name, chat._nickname);
            var msg_btn = document.querySelector('.button_send_mes');
            var input = document.querySelector('.in_mes_text');
        
            msg_btn.addEventListener('click', () => {
                if(input.value !== '')
                    chat.sendMessage(input.value);
        
               input.value = '';
            });   
        };

        return chat._ws;
    },
};