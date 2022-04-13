const socket = io()

//Elements
const $messageForm = document.querySelector('form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')

const $sendLocation = document.querySelector('#send-location')

const $messages = document.querySelector('#messages')
// const $link = document.querySelector('#link')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const urlTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
// const formMessage = document.querySelector('form')
// const inputMessage = document.querySelector('#message')

//Options
const { username, room } = Qs.parse(location.search,{ ignoreQueryPrefix:true })//ignore question mark


const autoscroll = () => {
    //New message element
    const $newMessage = $messages.lastElementChild

    //Height of the new message element
    const newMessageStyles = getComputedStyle($newMessage)//Mình dùng cái này để lấy cả margin của phần tử vì offsetHeight k bao gồm
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)//'16px' to 16px
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //Visible height of the message container
    const visibleHeight = $messages.offsetHeight

    // Height of the messages container
    const containerHeight = $messages.scrollHeight

    //How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight
    //Tính từ điểm bắt đầu của div messages, càng scroll thì càng lớn(chưa tính visible)
    //+ chiều cao của cái phần div mình nhìn thấy nữa(visibleHeight) => ví trí của mình
    
    //Nếu như mà mình đã scroll tới cùng(chiều cao hiện tại trừ chiều cao mess mới = vị trí của mình)
    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight//scroll div tới tận cùng(hết chiều cao cảu div)
    }
}                                                            

socket.on('message', (message) => {
    console.log("huhu")
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render(urlTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    console.log(users)
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit',(e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')//disable button before message sent to server

    const message = e.target.elements.message.value
    socket.emit('sendMessage', message, (error) => {
        // console.log(message)
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if(error) {
            return console.log(error)
        }
        console.log('Message delivered!')
    })
    // console.log(inputMessage.value)
})

//Elements

//geolocation
$sendLocation.addEventListener('click', (e) => {
    if (!navigator.geolocation){
        return alert('Geolocation is not available for your')
    }

    navigator.geolocation.getCurrentPosition((position) => {
        $sendLocation.setAttribute('disabled','disabled')//disable before fetching done
        // console.log(position.coords.latitude)
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        },() => {
            $sendLocation.removeAttribute('disabled')
            console.log('Location shared')
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'//Nếu có lỗi khi vào phòng thì sẽ báo lỗi rồi redirect lại trang nhập tên
    }
})