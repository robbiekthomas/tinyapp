const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const { getUserByEmail, generateRandomString } = require("./helpers");

const app = express();
const PORT = 8080; // default port 8080

app.use(
  cookieSession({
    name: "session",
    keys: ["test"],
  })
);
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

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
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10),
  },
  aJ48lW: {
    id: "aJ48lW",
    email: "user2@example.com",
    password: bcrypt.hashSync("asdf", 10),
  },
};

//========================================

// -------- App Requests -------

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
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
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = {
    user,
  };
  if (!user) {
    const templateVars = {
      user,
    };
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  if (!urlDatabase[req.params.id]) {
    const templateVars = {
      user,
    };
    res.render("shortURLDoesNotExist", templateVars);
    return;
  }

  if (!user) {
    const templateVars = {
      user,
    };
    res.render("shortenedURLsForbidden", templateVars);
    return;
  }
  if (userID !== urlDatabase[req.params.id].userID) {
    const templateVars = {
      user,
    };
    res.render("shortenedURLDoesNotBelong", templateVars);
    return;
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
  const userID = req.session.user_id;
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
    return;
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const ID = req.session.user_id;
  const user = users[ID];
  const urlObject = urlDatabase[req.params.id];

  if (!urlObject) {
    res.status(404).send("That URL does not exist");
    return;
  }
  if (!user) {
    res.status(403).send("You need to login before you delete a URL");
    return;
  }
  if (urlObject.userID !== ID) {
    res.status(401).send("You do not have access to that URL");
    return;
  }

  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const ID = req.session.user_id;
  const user = users[ID];
  const urlObject = urlDatabase[req.params.id];

  if (!urlObject) {
    res.status(404).send("That URL does not exist");
    return;
  }
  if (!user) {
    res.status(403).send("You need to login before you edit a URL");
    return;
  }
  if (urlObject.userID !== ID) {
    res.status(401).send("You do not have access to that URL");
    return;
  }

  urlDatabase[req.params.id].longURL = req.body.editURL;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// ----- REGISTER ROUTES START ----///
app.get("/register", (req, res) => {
  const userID = req.session.user_id;
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
    return;
  }

  if (getUserByEmail(req.body.email, users)) {
    res.status(400).send("That email is already taken");
    return;
  }

  const randomString = generateRandomString();
  users[randomString] = {
    id: randomString,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10),
  };
  req.session.user_id = randomString;
  res.redirect(`/urls/`);
});
///--- REGISTER ROUTE ENDS HERE ------///

// ----- LOGIN ROUTES START ----///
app.get("/login", (req, res) => {
  const userID = req.session.user_id;
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
      bcrypt.compareSync(req.body.password, users[user].password)
    ) {
      const id = users[user].id;
      req.session.user_id = id;
      res.redirect("/urls");
      return;
    }
  }
  res.status(403).send("Username or Password is incorrect");
});
///--- LOGIN ROUTE ENDS HERE ------///

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
