const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();



public_users.post("/register", (req,res) => {
    const username = req.body.username;   
    const password = req.body.password;   
  
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    const userExists = users.some((user) => user.username === username);
    if (userExists) {
      return res.status(409).json({ message: "User already exists" });
    }
  
    users.push({ username: username, password: password });
    return res.status(200).json({ message: "User successfully registered" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    return res.status(200).json(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;       
    const book = books[isbn];           
    if (book) {
      return res.status(200).json(JSON.stringify(book, null, 4)); 
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;        
    const bookKeys = Object.keys(books);     
    let filteredBooks = [];                  
  
    bookKeys.forEach((key) => {
      if (books[key].author === author) {
        filteredBooks.push(books[key]);
      }
    });
  
    if (filteredBooks.length > 0) {
      return res.status(200).json(JSON.stringify(filteredBooks, null, 4));
    } else {
      return res.status(404).json({ message: "No books found for this author" });
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;          
    const bookKeys = Object.keys(books);     
    let filteredBooks = [];                  
  
    bookKeys.forEach((key) => {
      if (books[key].title === title) {
        filteredBooks.push(books[key]);
      }
    });
  
    if (filteredBooks.length > 0) {
      return res.status(200).json(JSON.stringify(filteredBooks, null, 4));
    } else {
      return res.status(404).json({ message: "No books found with this title" });
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;     
    const book = books[isbn];         
    if (book && book.reviews) {
      return res.status(200).json(JSON.stringify(book.reviews, null, 4));
    } else {
      return res.status(404).json({ message: "No reviews found for this book" });
    }
});

public_users.get('/async/books', function (req, res) {
    const getBooksPromise = new Promise((resolve, reject) => {
      if (books) {
        resolve(books);
      } else {
        reject("Books not found");
      }
    });
  
    getBooksPromise
      .then((data) => {
        return res.status(200).json(JSON.stringify(data, null, 4));
      })
      .catch((err) => {
        return res.status(404).json({ message: err });
      });
  });
  
  public_users.get('/async/isbn/:isbn', async function (req, res) {
    try {
      const isbn = req.params.isbn;
      const result = await new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) resolve(book);
        else reject("Book not found");
      });
      return res.status(200).json(JSON.stringify(result, null, 4));
    } catch (err) {
      return res.status(404).json({ message: err });
    }
  });
  
  public_users.get('/async/author/:author', async function (req, res) {
    try {
      const author = req.params.author;
      const bookKeys = Object.keys(books);
      const result = await new Promise((resolve) => {
        const filtered = bookKeys
          .filter((key) => books[key].author === author)
          .map((key) => books[key]);
        resolve(filtered);
      });
  
      if (result.length > 0) {
        return res.status(200).json(JSON.stringify(result, null, 4));
      } else {
        return res.status(404).json({ message: "No books found for this author" });
      }
    } catch (err) {
      return res.status(500).json({ message: err });
    }
  });
  
  public_users.get('/async/title/:title', function (req, res) {
    const title = req.params.title;
    const getByTitle = new Promise((resolve, reject) => {
      const filtered = Object.keys(books)
        .filter((key) => books[key].title === title)
        .map((key) => books[key]);
      if (filtered.length > 0) resolve(filtered);
      else reject("No books found with this title");
    });
  
    getByTitle
      .then((data) => {
        return res.status(200).json(JSON.stringify(data, null, 4));
      })
      .catch((err) => {
        return res.status(404).json({ message: err });
      });
  });

module.exports.general = public_users;
