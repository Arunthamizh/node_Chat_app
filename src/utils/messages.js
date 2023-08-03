const generateMessage = (username, text) =>{
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}

const generteLocationMessages = (username, url) =>{
    return{
    username,
    url,
    createdAt1: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generteLocationMessages
}