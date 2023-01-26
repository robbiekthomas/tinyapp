const getUserByEmail = function (email, database) {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
};

function generateRandomString() {
  const alphabet = "abcdefghijklmnopqrstuvwxyz1234567890";
  const random = [];
  for (let i = 0; i < 6; i++) {
    let randomCharacter = alphabet[Math.floor(Math.random() * alphabet.length)];
    random.push(randomCharacter);
  }
  return random.join("");
}

module.exports = { getUserByEmail, generateRandomString };
