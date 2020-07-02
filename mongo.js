const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('Please provide the password as an argument: node mongo.js <password>')
    process.exit(1)
}

const password = process.argv[2]

const url =
    `mongodb+srv://fullstack:${password}@trainingcluster.ij3b2.mongodb.net/phonebook-app?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

const phonebookSchema = new mongoose.Schema({
    name: String,
    number: String
})

const Person = mongoose.model('Person', phonebookSchema)

if (process.argv.length === 3)
    Person.find({}).then(result => {
        console.log(`phonebook:`)
        result.forEach(person => {
            if (person.name)
                console.log(person.name, person.number)
        })
        mongoose.connection.close()
    })
else if (process.argv.length > 4) {
    const person = new Person({
        name: process.argv[3],
        number: process.argv[4]
    })

    person.save().then(result => {
        console.log(`added ${person.name} number ${person.number} to phonebook`)
        mongoose.connection.close()
    })

} else
    console.log(`please provide both a name and a number.`)


