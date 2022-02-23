const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//The users Object must be filled with OBJECTS in the following format: "userRandomID": { id: "userRandomID", email: "user@example.com", password: "purple-monkey-dinosaur" }
const users = {};

//function to generate a shortURL with a string of 6 random alphanumeric characters
function generateRandomString() {
  const characters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const charactersLength = characters.length;
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += characters[Math.floor(Math.random() * charactersLength)];
  }
  return result;
};

const checkEmail = function (email, object) {
  for (let user in object) {    
    if (email === object[user].email) {
      return true;
    }
  }
  return false;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
}); 

///////////////
app.get("/urls", (req, res) => {  
  const templateVars = { user: users[req.cookies.user_id], urls: urlDatabase };
  res.render("urls_index", templateVars);  
});

// this method handle the POST sent to /urls from the form that request a new short URL
app.post("/urls", (req, res) => {
  console.log("New short URL requested to: ", req.body);
  const randomShortURL = generateRandomString();
  urlDatabase[randomShortURL] = req.body.longURL;
  const templateVars = { user: users[req.cookies.user_id], shortURL: randomShortURL, longURL: urlDatabase[randomShortURL]};
  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {  
  const shortURL = req.params.shortURL  
  res.redirect(`/urls/${shortURL}`)
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {  
  delete urlDatabase[req.params.shortURL];  
  res.redirect("/urls");
});

app.post("/urls/edit/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL] = newLongURL;
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] };
  res.render("register_view", templateVars);
});

app.post("/register", (req, res) => {  
  const randomId = generateRandomString();
  const userEmail = req.body.email;
  const userPassword = req.body.password;

  if (userEmail === "" || userPassword === "") {
    res.send("<h1>400</h1>");
  } else if (checkEmail(userEmail, users) === true) {
    res.send("<h1>400</h1>");  
  } else {
    users[randomId] = { id: randomId, email: userEmail, password: userPassword };
    
    res.cookie("user_id", randomId);  

    res.redirect("/urls");    
  }
});

app.post("/register/r", (req, res) => {
  res.redirect("/register");
});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] };
  res.render("login_view", templateVars);
});

app.post("/login", (req, res) => {  
  res.redirect("/login");  
});

app.post("/logout", (req, res) => {  
  res.clearCookie("user_id");
  res.redirect("/urls")
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});