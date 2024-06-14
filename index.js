const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");
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

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/", (req, res) => {
  res.send("<h1>Hello World!</h1>");
});

app.get("/api/persons", (req, res) => {
  res.json(persons);
});

app.get("/info", (req, res) => {
  const time = new Date();
  const totalPeople = persons.length;
  res.send(`<p>Phonebook has info for ${totalPeople} people</p>
  <p>${time}</p>`);
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  // console.log(id);
  const person = persons.find((person) => person.id === id);
  // console.log(person);
  if (person) {
    res.json(person);
  } else {
    res.status(404).end();
  }
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter((person) => person.id !== id);

  res.status(204).end();
});

app.post("/api/persons", (req, res) => {
  const body = req.body;
  // console.log(person);
  if (!body.name || !body.number) {
    return res.status(400).json({ error: "missing name or number" });
  }

  const checkSameName = persons.find((person) => person.name === body.name);
  if (checkSameName) {
    return res.status(400).json({ error: "name must be unique" });
  }

  const newId = Math.floor(Math.random() * 100000);
  //create new person object
  const newPerson = {
    id: newId,
    name: body.name,
    number: body.number,
  };

  //add new person to phonebook
  persons = persons.concat(newPerson);

  res.json(newPerson);
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
