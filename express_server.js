const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());



//DATABASES-------------------------------------------------
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "" }
};

//The users Object must be filled with OBJECTS in the following format: "userRandomID": { id: "userRandomID", email: "user@example.com", password: "purple-monkey-dinosaur" }
const users = {};



//FUNCTIONS--------------------------------------------------
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
      return users[user];
    }
  }
  return false;
};

const urlsForUser = function(id) {
  let result = {};
  for (let element in urlDatabase) {    
    if (id === urlDatabase[element].userID) {
      result[element] = urlDatabase[element];
    }
  }
  return result;
};


//ROUTS----------------------------------------------------
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
  if (req.cookies.user_id) {
    const usersUrls = urlsForUser(req.cookies.user_id);
    const templateVars = { user: users[req.cookies.user_id], urls: usersUrls };
    res.render("urls_index", templateVars);  
  } else {
    res.send("<h1>Please, login or register.</h1>");
  }
  
});

app.get("/urls/new", (req, res) => {
  if (req.cookies.user_id) {
    const templateVars = { user: users[req.cookies.user_id] };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.post("/urls/new", (req, res) => {  
  const randomShortURL = generateRandomString();
  
  urlDatabase[randomShortURL] = { longURL: req.body.longURL, userID: req.cookies.user_id };
  
  const templateVars = { user: users[req.cookies.user_id], shortURL: randomShortURL, longURL: urlDatabase[randomShortURL].longURL};
  res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => {
  const usersUrls = urlsForUser(req.cookies.user_id);

  if (req.cookies.user_id && Object.keys(usersUrls).length) {
    const templateVars = { user: users[req.cookies.user_id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
    res.render("urls_show", templateVars);
  } else {
    res.send("<h1>Please, login or register.</h1>");
  }  
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`)
});

app.get("/u/:shortURL", (req, res) => {
  const urlDatabaseKeys = Object.keys(urlDatabase);
  for (let id of urlDatabaseKeys) {
    if (id === req.params.shortURL) {
      const longURL = urlDatabase[req.params.shortURL].longURL;
      return res.redirect(longURL);
    }
  }
  res.send("<h1>The short URL requested does not exist in database.</h1>");
  
});

app.post("/urls/:shortURL/delete", (req, res) => {  
  delete urlDatabase[req.params.shortURL];  
  res.redirect("/urls");
});

app.post("/urls/edit/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL].longURL = newLongURL;
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
  } else if (checkEmail(userEmail, users)) {
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
  const loginEmail = req.body.email;
  const loginPassword = req.body.password;

  if (checkEmail(loginEmail, users)) {
    const userProfile = checkEmail(loginEmail, users);
    if (loginPassword === userProfile.password) {      
      res.cookie("user_id", userProfile.id);      
      return res.redirect("/urls");      
    }
  }

  res.send("<h1>403</h1>");
});

app.post("/login/r", (req, res) => {
  res.redirect("/login");
});

app.post("/logout", (req, res) => {  
  res.clearCookie("user_id");
  res.redirect("/urls")
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});