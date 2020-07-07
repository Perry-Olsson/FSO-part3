require('dotenv').config();
const express = require("express");
const morgan = require("morgan");
const cors = require('cors');
const Person = require('./models/person');
const { response } = require('express');

const app = express();

morgan.token("request-body", (req, res) => {
  if (req.body.name)
    return JSON.stringify(req.body);
});

app.use(express.static('build'));
app.use(express.json());
app.use(cors());
app.use(
  morgan(
    `:method :url :status :res[content-length] :request-body - :response-time ms`
  )
);

app.get("/api/persons", (req, res) => {
  Person.find({}).then(people => {
    res.json(people)
  })
  .catch(error => {
    console.log(error);
    res.status(404).end();
  });
});

app.get("/info", (req, res) => {
  const length = persons.length;
  const timeStamp = new Date();

  res.send(
    `<h3>Phonebook has info for ${length} people</h3><h3>${timeStamp}</h3>`
  );
});

app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id).then(person => {
    if (person) 
      res.json(person);
    else 
      res.status(404).end();
  })
  .catch(error => next(error));
});

// const generateId = () => {
//   return Math.round(Math.random() * 1000000);
// };

// const handleErrors = (body) => {
//   if (!body.name || !body.number) {
//     return {
//       errorFound: true,
//       status: 400,
//       error: "Content missing",
//     };
//   }
//   for (person of persons) {
//     if (person.name === body.name)
//       return {
//         errorFound: true,
//         status: 400,
//         error: "name must be unique",
//       };
//   }
//   return { errorFound: false };
// };

app.post("/api/persons", (req, res) => {
  const body = req.body;

  // const errors = handleErrors(body);

  // if (errors.errorFound) {
  //   return res.status(errors.status).json({
  //     error: errors.error,
  //   });
  // }

  if (body.name === undefined || body.number === undefined)
    return res.status(400).json({error: 'content missing'});

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save().then(savedPerson => res.json(savedPerson))
});

app.put("/api/persons/:id", (req, res, next) => {
  const body = req.body;

  if (body.name === undefined || body.number === undefined)
    return res.status(400).json({error: 'content missing'});

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
  .then(updatedPerson => {
    res.json(updatedPerson);
  })
  .catch(error => next(error));
})

app.delete("/api/persons/:id", (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
  .then(result => {
    res.status(204).end();
  })
  .catch(error => next(error));
});

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' });
}

app.use(unknownEndpoint);

const errorHandler = (error, req, res, next) => {
  console.error(error.message);

  if (error.name === 'CastError') 
    return res.status(400).send({error: 'malformatted id'});

  next(error);
}

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}.`));
