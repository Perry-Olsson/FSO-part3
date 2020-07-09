require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

morgan.token('request-body', (req) => {
  if (req.body.name)
    return JSON.stringify(req.body)
})

app.use(express.static('build'))
app.use(express.json())
app.use(cors())
app.use(
  morgan(
    ':method :url :status :res[content-length] :request-body - :response-time ms'
  )
)

app.get('/api/persons', (req, res, next) => {
  Person.find({}).then(people => {
    res.json(people)
  })
    .catch(error => next(error))
})

app.get('/info', async (req, res) => {
  const people = await Person.find({})
  const length = people.length
  const timeStamp = new Date()

  res.send(
    `<h3>Phonebook has info for ${length} people</h3><h3>${timeStamp}</h3>`
  )
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id).then(person => {
    if (person)
      res.json(person)
    else
      res.status(404).end()
  })
    .catch(error => next(error))
})


app.post('/api/persons', (req, res, next) => {
  const body = req.body

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save()
    .then(savedPerson => savedPerson.toJSON())
    .then(savedAndFormattedPerson => res.json(savedAndFormattedPerson))
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body

  if (body.name === undefined || body.number === undefined)
    return res.status(400).json({ error: 'content missing' })

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findOneAndUpdate({ _id:req.params.id }, person, { runValidators: true, context: 'query', new: true })
    .then(updatedPerson => {
      if (!updatedPerson){
        return res.status(404).json({ type: 'notFound', error: `${person.name} was was not found in the phonebook` })
      }
      res.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  console.error(error)

  if (error.name === 'CastError')
    return res.status(400).send({ error: 'malformatted id' })
  else if (error.name === 'ValidationError')
    return res.status(400).json({ error: error.message })
  else if (error.name === 'Person missing')
    return res.status(404).json({ error: error.message })

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server is running on port ${PORT}.`))
