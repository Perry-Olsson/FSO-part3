const express = require("express");
const morgan = require("morgan");
const cors = require('cors');
const mongoose = require('mongoose');
const { response } = require("express");

const app = express();
const password = process.env.PASSWORD;
const url =
  `mongodb+srv://fullstack:${password}@trainingcluster.ij3b2.mongodb.net/phonebook-app?retryWrites=true&w=majority`;
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

const phonebookSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', phonebookSchema);

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
  Person.find({}).then(people => {
    response.json(people)
  })
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
