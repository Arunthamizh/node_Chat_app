// // call the function
// socket.on('countUpdated',(count)=>{
//     console.log('The count has been updated' + count)
// })

// document.getElementById('inc').addEventListener('click', ()=>{
//     console.log('clicked')
//     socket.emit('increment')
// })
// send and receive event between the client and server
const socket = io()
// Element
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('#message')
const $messageFormButton = document.querySelector('#send')
const $shareLocation = document.querySelector('#shareLocation')

const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')
const $messageTemplate = document.querySelector('#message-template').innerHTML;

const $locationMessage = document.querySelector('#locationMessage').innerHTML;
const $sidebartemplate = document.querySelector('#sidebar-template').innerHTML;
// query string parser

const { username, room} =   Qs.parse(location.search,{ ignoreQueryPrefix: true})

const autoscroll = ()=>{
    debugger
// new message element
const $newmessages = $messages.lastElementChild
    // Height of the new message
    const newMessageStyles = getComputedStyle($newmessages)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newmessages.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('locationRender',(message)=>{
   const locRen =  Mustache.render($locationMessage,{
        username:message.username,
        url:message.url,
        createdAt: moment(message.createdAt).format('h:mm:ss a')
    })

    $messages.insertAdjacentHTML('beforeend',locRen)
    autoscroll()
})

socket.on('roomData',({room, users})=>{
console.log('room',room)
console.log('users',users)
const html = Mustache.render($sidebartemplate,{
    room,
    users
})
debugger
// $sidebar.remove('<ul>')
const sidediv = document.getElementById('sidediv')
if(sidediv){
    $sidebar.removeChild(sidediv)
}

$sidebar.insertAdjacentHTML('beforeend',html)
})

socket.on('message', (welcome) => {
   console.log('welcome',welcome)
   const html = Mustache.render($messageTemplate ,{
    username: welcome.username,
       message: welcome.text,
       createdAt: moment(welcome.createdAt).format('h:mm:ss a')
    //    createdAt: new Date(welcome.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
   })

   $messages.insertAdjacentHTML('beforeend',html)
   autoscroll()
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    //disabl

    $messageFormButton.setAttribute('disabled', 'disabled')
    console.log('callllllllllllll')
    // const message = document.getElementById('message').value
    const msg = e.target.elements.message.value
    socket.emit('sendMessage', msg, (error) => {
        debugger
        $messageFormButton.removeAttribute('disabled',false)
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if (error) {
            return console.log(error)
        }

        console.log('Message delivered!')
    })
})

$shareLocation.addEventListener('click', () => {
    //navigator.geolocation is accessed in the browser
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported in your browser')
    }
    $shareLocation.setAttribute('disabled',false)
    navigator.geolocation.getCurrentPosition((position) => {
        console.log(position)
        socket.emit('sendlocation', position.coords.latitude, position.coords.longitude,
        // acknowledgement
        () => {
            console.log('Location is shared')
            $shareLocation.removeAttribute('disabled',true)
        })
    })
})


socket.emit('join',{username, room},(error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})
