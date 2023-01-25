const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const PORT = 8080; // default port 8080

app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// ---- DATA -----

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  j3ihl4: {
    id: "j3ihl4",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  s92hb3: {
    id: "j3ihl4",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// ----- Helper Functions -------

function generateRandomString() {
  const alphabet = "abcdefghijklmnopqrstuvwxyz1234567890";
  const random = [];
  for (let i = 0; i < 6; i++) {
    let randomCharacter = alphabet[Math.floor(Math.random() * alphabet.length)];
    random.push(randomCharacter);
  }
  return random.join("");
}

function getUserByEmail(userData, userName) {
  for (let user in userData) {
    if (userData[user].email === userName) {
      return false;
    }
  }
  return true;
}

// -------- App Requests -------

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
});

app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[userID];
  const templateVars = {
    user,
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[userID];
  const templateVars = {
    user,
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[userID];
  const templateVars = {
    user,
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const randomString = generateRandomString();
  urlDatabase[randomString] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${randomString}`);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.editURL;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id", req.body.user_id);
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[userID];
  const templateVars = {
    user,
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.sendStatus(400);
  }

  if (!getUserByEmail(users, req.body.email)) {
    res.sendStatus(400);
  }

  const randomString = generateRandomString();
  users[randomString] = {
    id: randomString,
    email: req.body.email,
    password: req.body.password,
  };
  res.cookie("user_id", randomString);
  res.redirect(`/urls/`);
});

app.get("/login", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[userID];
  const templateVars = {
    user,
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  res.redirect("/login");
});
