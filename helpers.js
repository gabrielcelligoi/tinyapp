
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

const getUserByEmail = function (email, object) {
  for (let user in object) {    
    if (email === object[user].email) {
      return object[user];
    }
  }
  return false;
};

const urlsForUser = function(id, database) {
  let result = {};
  for (let element in database) {    
    if (id === database[element].userID) {
      result[element] = database[element];
    }
  }
  return result;
};

module.exports = { generateRandomString, getUserByEmail, urlsForUser };