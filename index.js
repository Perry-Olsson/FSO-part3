const express = require("express");
const morgan = require("morgan");
const cors = require('cors');

const app = express();

let persons = [
  {
    id: 2,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 3,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
  {
    id: 5,
    name: "Ada Lovelace",
    number: "23423",
  },
  {
    id: 6,
    name: "Arto Hellace",
    number: "(234)-223-3421",
  },
];

morgan.token("request-body", (req, res) => {
  if (req.body.name)
    return JSON.stringify(req.body);
});

app.use(express.json());
app.use(cors());
app.use(express.static('build'));
app.use(
  morgan(
    `:method :url :status :res[content-length] :request-body - :response-time ms`
  )
);

app.get("/api/persons", (req, res) => {
  res.json(persons);
});

app.get("/info", (req, res) => {
  const length = persons.length;
  const timeStamp = new Date();

  res.send(
    `<h3>Phonebook has info for ${length} people</h3><h3>${timeStamp}</h3>`
  );
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const note = persons.find((note) => note.id === id);

  note ? res.json(note) : res.status(404).end();
});

const generateId = () => {
  return Math.round(Math.random() * 1000000);
};

const handleErrors = (body) => {
  if (!body.name || !body.number) {
    return {
      errorFound: true,
      status: 400,
      error: "Content missing",
    };
  }
  for (person of persons) {
    if (person.name === body.name)
      return {
        errorFound: true,
        status: 400,
        error: "name must be unique",
      };
  }
  return { errorFound: false };
};

app.post("/api/persons", (req, res) => {
  const body = req.body;

  const errors = handleErrors(body);

  if (errors.errorFound) {
    return res.status(errors.status).json({
      error: errors.error,
    });
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number,
  };

  persons = persons.concat(person);

  res.json(person);
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter((note) => note.id !== id);

  res.status(204).end();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}.`));
