const { assert } = require('chai');

const { generateRandomString, getUserByEmail, getUrlByUserId } = require('../helpers.js');

//Test databases
const testUsers = {
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
};

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "123" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "qwe" }
};

//Assertions
describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.strictEqual(user, testUsers[expectedUserID]);
  });

  it('should return false with invalid email', function() {
    const user = getUserByEmail("invalid@example.com", testUsers);
    const expectedUserID = false;
    assert.equal(user, expectedUserID);
  });
});

describe('generateRandomString', function() {
  it('should return a 6 characters string', function() {
    const randomString = generateRandomString();
    const stringLength = randomString.length;
    assert.equal(stringLength, 6);
  });

  it('should return a diferent string each time the function is called', function() {
    const string1 = generateRandomString();
    const string2 = generateRandomString();
    assert.notEqual(string1, string2);
  });
});

describe('getUrlByUserId', function() {
  it('should return an object with valid ID', function() {
    const shortURL = getUrlByUserId("123", urlDatabase);
    const expectedResult = { b2xVn2: { longURL: 'http://www.lighthouselabs.ca', userID: '123' } };
    assert.deepEqual(shortURL, expectedResult);
  });

  it('should return an empty Object with invalid ID', function() {
    const shortURL = getUrlByUserId("invalid", urlDatabase);
    const expectedResult = {};
    assert.deepEqual(shortURL, expectedResult);
  });
});