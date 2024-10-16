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
  Person.find({})
    .then((persons) => {
      if (persons) {
        res.json(persons);
      } else {
        res.status(404).end();
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).end();
    });
});

//handle new person
app.post("/api/persons", (req, res) => {
  const body = req.body;

  if (!body.name || !body.number) {
    return res.status(400).json({ error: "missing name or number" });
  }

  const newPerson = new Person({
    name: body.name,
    number: body.number,
  });

  newPerson
    .save()
    .then((savedPerson) => {
      res.json(savedPerson);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json("failed to save new person");
    });
});

//delete a phonebook entry
app.delete("/api/persons/:id", (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then((result) => {
      res.status(204).end();
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({ error: "malformatted id!" });
    });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
