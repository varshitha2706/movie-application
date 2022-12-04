var express = require('express'); 
var app = express(); 
const port = 3000;
const request = require('request');

app.set('view engine', 'ejs');

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, DocumentSnapshot} = require('firebase-admin/firestore');

var serviceAccount = require("./key.json");

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

app.get("/", function (req, res) {  
  res.render('initial.ejs');  
}); 

app.get('/signup', function (req, res) {
  res.render('signup');
}); 

app.get("/signupSubmit",function( req, res){
    const first_name = req.query.first_name;
    const last_name = req.query.last_name;
    const email = req.query.email;
    const password = req.query.psw;
    const rep_psw = req.query.re_psw;
    if(password == rep_psw){
        db.collection('users')
        .add({
            name: first_name + last_name,
            email: email,
            password: password,
        }).then(() => {
            res.render("login");
        });
    }else{
        res.send("SignUp Failed");
    }
});

app.get("/login", (req, res) => {
   res.render('login');
}); 
  
app.get("/loginSubmit" , function(req, res){
  const email=req.query.emil;
  const password = req.query.pswrd;
  db.collection("users")
      .where("email", "==", email)
      .where("password", "==", password)
      .get()
      .then((docs) => {
          if(docs.size>0){
              var usersData = [];
              db.collection('users')
                  .get()
                  .then(() => {
                      docs.forEach((doc) => {
                          usersData.push(doc.data());
                  });
              })
              .then(() => {
                  console.log(usersData);
                  res.render('home' , {userData: usersData},);
              }); 
          }else{
              res.send("Login Failed");
          }
      });
});

app.get("/last", (req, res) => {
  res.render('last');
});

app.get("/movie", (req, res) => {
  res.render('movie');
});

const API_KEY = 'api_key=b5e96b7f83d7c6e56b241640d2301eb4';
const BASE_URL = 'https://api.themoviedb.org/3/';
const API_URL = BASE_URL + '/discover/movie?sort_by=popularity.desc&'+ API_KEY;
const IMG_URL = 'https://media.istockphoto.com/photos/green-404-error-message-with-magnifying-glass-picture-id173932679?k=6&m=173932679&s=612x612&w=0&h=lEi8X2G04qr2sw1YWghuYbN9_CZY0OTBClR7Bt3T6Wc=';
const searchURL = BASE_URL + '/search/movie?'+API_KEY; 

app.get("/movienamesearch", (req, res) => {
  const moviename = req.query.moviename;
  var movieData = []

  var url;
  if(moviename){
      url = searchURL+'&query='+moviename;
  }
  else{
      url = API_URL;
  }
  request(url , function(error,response,body){
      var data = JSON.parse(body).results;
      if(data){
          showMovies(data);
          
          function showMovies(data) { 
              data.forEach(movie => {
                  movieData.push(movie);
              })
          }
          console.log(movieData);
          res.render('movie', {userData: movieData},);

      }
      else{
          console.log("not there");
      }
  })
})

app.listen(3000, function () {  
console.log('Example app listening on port 3000!'); 
});