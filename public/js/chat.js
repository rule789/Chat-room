var socket = io();

// 當newMessage 和 newLocationMessage時發生
function scrollToBottom() {
  var messages = jQuery('#messages');
  var newMessage = messages.children('li:last-child');
  // 那個元素的各Heights
  var clientHeight = messages.prop('clientHeight');
  var scrollTop = messages.prop('scrollTop');
  var scrollHeight = messages.prop('scrollHeight');
  // 抓出newMessage的css padding高度
  var newMessageHeight = newMessage.innerHeight();
  var lastMessageHeight = newMessage.prev().innerHeight(); //.prev() 前面一個child

  if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
    messages.scrollTop(scrollHeight);
  }
}


socket.on('connect', function() {

  // 創立or加入聊天室
  var params = jQuery.deparam(window.location.search);

  socket.emit('join', params, function(error) {
    if (error) {
      alert(error);
      window.location.href = '/';
    } else {
      console.log('No error');
    }
  });
});


socket.on('disconnect', function() {
  console.log('Disconnected from server');
});

// 更新聊天室名單
socket.on('updateUserList', function(users) {
  var ol = jQuery('<ol></ol>');

  users.forEach(function(user) {
    ol.append(jQuery('<li></li>').text(user))
  });
  // 用DOM 替換名單
  jQuery('#users').html(ol);
});

// 新訊息
socket.on('newMessage', function(message) {
  var formattedTime = moment(message.createAt).format('h:mm a');
  // template
  var template = jQuery('#message-template').html(); //抓id裡的inner html
  var html = Mustache.render(template, {
    text: message.text,
    from: message.from,
    createAt: formattedTime
  });
  jQuery('#messages').append(html);
  scrollToBottom();
});


// location變成url
socket.on('newLocationMessage', function(message) {
  var formattedTime = moment(message.createAt).format('h:mm a');
  var template = jQuery('#location-message-template').html();
  var html = Mustache.render(template, {
    from: message.from,
    createAt: formattedTime,
    link: message.url
  });
  jQuery('#messages').append(html);
  scrollToBottom();
});


// 傳訊息
jQuery('#message-form').on('submit', function(e) {
  e.preventDefault();

  var messageTextbox = jQuery('[name=message]');

  socket.emit('createMessage' , {
    // from: "User",
    text: messageTextbox.val()
  } , function() {
    // 完成後把text內容刪光
    messageTextbox.val('');
  });
});

// 分享位置
var locationButton = jQuery('#send-location');

locationButton.on('click', function() {
  if (!navigator.geolocation) {
    return alert('Geolocation not supported by your browser.');
  }

  locationButton.attr('disabled', 'disabled').text('Sending location...');

  navigator.geolocation.getCurrentPosition(function(position) {
    locationButton.removeAttr('disabled').text('Send location');
    socket.emit('createLocationMessage', {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    });
  }, function() {
    locationButton.removeAttr('disabled').text('Send location')
    alert('Unable to fetch location.');
  });
});

