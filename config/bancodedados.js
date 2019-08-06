if (process.env.NODE_ENV == "production"){
    module.exports = {mongoURI:'mongodb+srv://admin:1q2w3e4r5t@cluster0-wqnay.mongodb.net/blogApp?retryWrites=true&w=majority'}
    console.log("banco de dados na nuvem")    
}else {
    module.exports = {mongoURI:'mongodb://localhost/blogApp'}
    console.log("banco de dados Local")   
}