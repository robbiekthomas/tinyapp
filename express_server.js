const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const PORT = 8080; // default port 8080

app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
// ---- DATA -----

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  j3ihl4: {
    id: "j3ihl4",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  aJ48lW: {
    id: "aJ48lW",
    email: "user2@example.com",
    password: "asdf",
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

/// HELPER FUNCTIONS ENDS HERE ------
//========================================

// -------- App Requests -------

app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[userID];
  const templateVars = {
    user,
  };
  if (!user) {
    res.render("shortenedURLsForbidden", templateVars);
  } else {
    const userDatabase = {};
    for (let url in urlDatabase) {
      if (urlDatabase[url].userID === user.id) {
        userDatabase[url] = urlDatabase[url];
      }
    }
    const templateVars = {
      user,
      urls: userDatabase,
    };
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[userID];
  const templateVars = {
    user,
  };
  if (!user) {
    const templateVars = {
      user,
    };
    res.render("shortenForbidden", templateVars);
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[userID];
  if (!urlDatabase[req.params.id]) {
    const templateVars = {
      user,
    };
    res.render("shortURLDoesNotExist", templateVars);
  }

  if (!user) {
    const templateVars = {
      user,
    };
    res.render("shortenedURLsForbidden", templateVars);
  }
  if (userID !== urlDatabase[req.params.id].userID) {
    const templateVars = {
      user,
    };
    res.render("shortenedURLDoesNotBelong", templateVars);
  }

  const templateVars = {
    user,
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const randomString = generateRandomString();
  const userID = req.cookies["user_id"];
  const user = users[userID];
  urlDatabase[randomString] = {
    longURL: req.body.longURL,
    userID: userID,
  };

  const templateVars = {
    user,
  };
  if (!user) {
    res.render("shortenForbidden", templateVars);
  } else {
    res.redirect(`/urls/${randomString}`);
  }
});

app.get("/u/:id", (req, res) => {
  let shortURL = req.params.id;
  if (urlDatabase[shortURL]) {
    let longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.status(404).send("That url does not exist");
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const ID = req.cookies["user_id"];
  const user = users[ID];
  const urlObject = urlDatabase[req.params.id];

  if (!urlObject) {
    res.status(404).send("That URL does not exist");
  }
  if (!user) {
    res.status(403).send("You need to login before you delete a URL");
  }
  if (urlObject.userID !== ID) {
    res.status(401).send("You do not have access to that URL");
  }

  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const ID = req.cookies["user_id"];
  const user = users[ID];
  const urlObject = urlDatabase[req.params.id];

  if (!urlObject) {
    res.status(404).send("That URL does not exist");
  }
  if (!user) {
    res.status(403).send("You need to login before you edit a URL");
  }
  if (urlObject.userID !== ID) {
    res.status(401).send("You do not have access to that URL");
  }

  urlDatabase[req.params.id].longURL = req.body.editURL;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id", req.body.user_id);
  res.redirect("/login");
});

// ----- REGISTER ROUTES START ----///
app.get("/register", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[userID];
  const templateVars = {
    user,
  };
  if (userID) {
    res.redirect("/urls");
  } else {
    res.render("register", templateVars);
  }
});

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).send("You did not fill in a username/password");
  }

  if (!getUserByEmail(users, req.body.email)) {
    res.status(400).send("That email is already taken");
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
///--- REGISTER ROUTE ENDS HERE ------///

// ----- LOGIN ROUTES START ----///
app.get("/login", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[userID];
  const templateVars = {
    user,
  };
  if (userID) {
    res.redirect("/urls");
  } else {
    res.render("login", templateVars);
  }
});
//Refactor the code for Post LOGIN and create a separate function for checking user email and password
app.post("/login", (req, res) => {
  for (let user in users) {
    if (
      users[user].email === req.body.email &&
      users[user].password === req.body.password
    ) {
      const id = users[user].id;
      res.cookie("user_id", id);
      res.redirect("/urls");
      return;
    }
  }
  res.status(403).send("Username or Password is incorrect");
});
///--- LOGIN ROUTE ENDS HERE ------///

