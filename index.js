require("dotenv").config;
const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");

const Person = require("./model/person");

app.use(cors());
app.use(express.json());

app.use(express.static("dist"));

morgan.token("body", (req) => {
  return req.method === "POST" ? JSON.stringify(req.body) : "";
});

app.use(
  // morgan(":method :url")
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

//get all persons
app.get("/api/persons", (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons);
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
