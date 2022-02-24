const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");
const { generateRandomString, getUserByEmail, getUrlByUserId } = require("./helpers");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000
}));

//DATABASES
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "" }
};

//The users Object must be filled with OBJECTS in the following format: "userRandomID": { id: "userRandomID", email: "user@example.com", password: "purple-monkey-dinosaur" }
const users = {};


//ROUTS
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  if (req.session.user_id) {
    const usersUrls = getUrlByUserId(req.session.user_id, urlDatabase);
    const templateVars = { user: users[req.session.user_id], urls: usersUrls };
    res.render("urls_index", templateVars);
  } else {
    res.send("<h1>Error: Please, login or register.</h1>");
  }
});

app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    const templateVars = { user: users[req.session.user_id] };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const usersUrls = getUrlByUserId(req.session.user_id, urlDatabase);

  if (req.session.user_id && Object.keys(usersUrls).length) {
    const templateVars = { user: users[req.session.user_id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
    res.render("urls_show", templateVars);
  } else {
    res.send("<h1>Please, login or register.</h1>");
  }
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

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  res.render("register_view", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  res.render("login_view", templateVars);
});


app.post("/urls/new", (req, res) => {
  const randomShortURL = generateRandomString();
  
  urlDatabase[randomShortURL] = { longURL: req.body.longURL, userID: req.session.user_id };
  
  const templateVars = { user: users[req.session.user_id], shortURL: randomShortURL, longURL: urlDatabase[randomShortURL].longURL};
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.send("<h1>Please, login or register.</h1>");
  }
});

app.post("/urls/edit/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL].longURL = newLongURL;
  res.redirect("/urls");
});


app.post("/register", (req, res) => {
  const randomId = generateRandomString();
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const userHashedPassword = bcrypt.hashSync(userPassword, 10);

  if (userEmail === "" || userPassword === "") {
    res.send("<h1>Error 400: Access Information Missing</h1>");
  } else if (getUserByEmail(userEmail, users)) {
    res.send("<h1>Error 400: Invalid Email</h1>");
  } else {
    users[randomId] = { id: randomId, email: userEmail, password: userHashedPassword };
        
    req.session.user_id = randomId;

    res.redirect("/urls");
  }
});

app.post("/register/r", (req, res) => {
  res.redirect("/register");
});

app.post("/login", (req, res) => {
  const loginEmail = req.body.email;
  const loginPassword = req.body.password;
  
  if (getUserByEmail(loginEmail, users)) {
    const userProfile = getUserByEmail(loginEmail, users);
    if (bcrypt.compareSync(loginPassword, userProfile.password)) {
      req.session.user_id = userProfile.id;
      return res.redirect("/urls");
    }
  }

  res.send("<h1>Error 403: Invalid Password</h1>");
});

app.post("/login/r", (req, res) => {
  res.redirect("/login");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});