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
        console.log(persons);
      } else {
        res.status(404).end();
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).end();
    });
});

//get person by id
app.get("/api/persons/:id", (req, res, next) => {
  const { id } = req.params;
  Person.findById(id)
    .then((persons) => {
      if (persons) {
        res.json(persons);
      } else {
        res.status(404).end();
      }
    })
    .catch((err) => next(err));
});

//handle new person
app.post("/api/persons", (req, res, next) => {
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
    .catch((err) => next(err));
});

//handle update
app.put("/api/persons/:id", (req, res, next) => {
  const { id } = req.params;
  const { number } = req.body;

  const updatedNumber = { number };

  Person.findByIdAndUpdate(id, updatedNumber, {
    new: true,
    runValidators: true,
    context: "query",
  })
    .then((updatedPerson) => {
      if (updatedPerson) {
        res.json(updatedPerson);
      } else {
        res.status(404).json({ error: "Not found!" });
      }
    })
    .catch((err) => next(err));
});

//delete a phonebook entry
app.delete("/api/persons/:id", (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then((result) => {
      res.status(204).end();
    })
    .catch((err) => next(err));
});

//get info
app.get("/info", (req, res, next) => {
  Person.find()
    .then((persons) => {
      const currentDate = new Date();
      const info = `<p>Phonebook has info for ${persons.length} people</p>
      <p>${currentDate}</p>
      `;
      res.send(info);
    })
    .catch((error) => next(error));
});

//error handling middleware
const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
