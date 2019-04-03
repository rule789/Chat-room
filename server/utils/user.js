// [{
//   id:'/#1245aaa',
//   name: 'BB',
//   room:'The office Fans'
// }]


class Users {
  // 所有的的user
  constructor () {
    this.users = [];
  }

  // 有人加入聊天室 把人家進array裡 return user
  addUser (id, name, room) {
    var user = {id, name, room};
    this.users.push(user);
    return user;
  }

  // 有人離開聊天室 從array裡刪掉 return是誰
  removeUser(id) {
    var user = this.getUser(id);

    if(user) {
      this.users = this.users.filter((user) => user.id !== id);
    }
    return user;
  }

  // 找user return user
  getUser(id) {
     return this.users.filter((user) => {
      return user.id === id;
    })[0];
  }

  // filter出同一聊天室的名字 return名單
  getUserList(room) {
    var users = this.users.filter((user) => {
      return user.room === room;
    });
    var namesArray = users.map((user) => {
      return user.name
    });
    return namesArray;
  }
}

module.exports = {Users};