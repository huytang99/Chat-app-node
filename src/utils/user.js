const users = []

// addUser, removeUser, getUser, getUsersInRoom
//User sẽ là object có 3 thuộc tính id, name, room

const addUser = ({ id, username, room }) => {
    // Clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Validate the data
    if (!username || !room){
        return {
            error: 'Username and room are required'
        }
    }
    // Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    //Validate Username
    if (existingUser) {
        return {
            error: 'Username already exists'
        }
    }

    //Store username
    const user = { id, username, room }
    users.push(user)
    return {
        user
    }
}

const removeUser = (id) => {
    //Có thể dùng filter để thay thế nhưng mà lâu hơn vì cái này tìm index cái là đi xóa liền chứ k đi hết
    const index = users.findIndex((user) => user.id === id)

    if(index !== -1) {
        return users.splice(index, 1)[0]//Nó trả về array các phần tử bị xóa mà mình chỉ xóa 1 nên là index 0
    }
}

const getUser = (id) => {
    const userIn = users.filter(user => user.id === id)
    if (!userIn.length){
        return ;
    }
    return userIn[0]
}
const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase();
    const userIn = users.filter(user => user.room === room)
    if(!userIn.length){
        return {
            'error': 'No user in the room'
        }
    }
    return userIn;
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}