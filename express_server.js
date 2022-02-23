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

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

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
  const templateVars = { username: req.cookies.username, urls: urlDatabase };
  res.render("urls_index", templateVars);  
});

// this method handle the POST sent to /urls from the form that request a new short URL
app.post("/urls", (req, res) => {
  console.log("New short URL requested to: ", req.body);
  const randomShortURL = generateRandomString();
  urlDatabase[randomShortURL] = req.body.longURL;
  const templateVars = { username: req.cookies.username, shortURL: randomShortURL, longURL: urlDatabase[randomShortURL]};
  res.render("urls_show", templateVars); 
});

app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies.username };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { username: req.cookies.username, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
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
  const templateVars = { username: req.cookies.username };
  res.render("register_view", templateVars);
});

app.post("/login", (req, res) => {
  console.log(req.body.username);  
  res.cookie("username", req.body.username);
  res.redirect("/urls");
  const username = req.body.username;
});

app.post("/logout", (req, res) => {  
  res.clearCookie("username");
  res.redirect("/urls")
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});