import express from 'express';
// This node version is what dictates that this need 'require' syntax, as opposed to import/export via Babel
const app = express();

app.set('port', process.env.PORT || 3000); //Sets the port variable to be used later
app.locals.title = 'Pet Box'; // Just giving a title to the app
app.locals.pets = [ //Storing data in local variables, but not good for production code!
  { id: 1, name: 'Buttermilk', type: 'dog', edited: false },
  { id: 2, name: 'Uno', type: 'cat', edited: false },
  { id: 3, name: 'Spaghetti', type: 'snake', edited: false },
  { id: 4, name: 'Mort', type: 'moss ball', edited: false }
]
app.use(express.json()); //Necessary for POSTing!!

app.get('/', (request, response) => {
  return response.send('Oh! Hey there Pet Box...!');
});

app.get('/api/v1/pets', (request, response) => {
  const { pets } = app.locals;
  return response.status(200).json({pets}); //Sends a stringified version and the 200 to the requesting client
});

app.get('/api/v1/pets/:id', (request, response) => {
  // return response.send({ // just getting/returning the string from the incoming request
    // id: request.params.id
  // }); 

  const id = parseInt(request.params.id);
  const { pets } = app.locals;
  const pet = pets.find(pet => pet.id === id);

  if (pet) {
    return response.status(200).json({ pet }); //Personal preference to add this object literal w/key of pet or not
  } else {
    return response.status(404).json({error: 'Pet not found'})
  }
});

app.post('/api/v1/pets', (request, response) => { //Same API to post as to get all pets, duplicated by design!!
  // Get the info for the new pet from the request
  const { pets } = app.locals;
  const newPet = request.body;
  // Make a newPet object w/id, name, type
  const newPetWithId = { id: Date.now(), ...newPet }; 
  // if I have a new pet, push it into the existing array
  // if there is no new pet, return some sort of error
  app.locals.pets = [...pets, newPetWithId]

  if (newPet) { //Checking for the incoming pet, because newPetWithId will always be an object
    return response.status(201).json({ id: newPetWithId.id });
  } else {
    return response.status(422).json('Could not parse pet') //422 = "unprocessable entity"
  }
  // return status code, maybe all the pets too
});

//update a pet's info
//app.put
//receive the updated info
//look for the matching id's object
//overwrite the old object info by key
//use conditional to see what status code to return w/message

app.put('/api/v1/pets/:id', (request, response) => {
  const { pets } = app.locals;
  const id = parseInt(request.params.id);
  const petToUpdate = pets.find(pet => pet.id === id);
  petToUpdate.name = request.body.name;
  petToUpdate.edited = true;
  const updatedPets = pets.map(pet => {
    return pet.id === id ? petToUpdate : pet ;
  });

  if (petToUpdate) {
    return response.status(202).json({ pets: updatedPets });
  } else {
    return response.status(422).json("Could not update pet");
  }
});

app.delete('/api/v1/pets/:id', (request, response) => {
  const { pets } = app.locals;
  const id = parseInt(request.params.id);
  const remainingPets = pets.filter(pet => pet.id !== id);
  app.locals.pets = remainingPets;

    if (remainingPets) {
      return response.status(200).json({ pets: remainingPets });
    } else {
      return response.status(422).json("Could not delete that pet");
    }
});

app.get('/api/v1/editedPets', (request, response) => {
  const { pets } = app.locals;
  const editedPets = pets.filter(pet => pet.edited);

      if (editedPets) {
        return response.status(200).json({ pets: editedPets });
      } else {
        return response.status(422).json("Could not find any edited pets");
      }
});

app.listen(app.get('port'), () => { 
  console.log(`${app.locals.title} is running on PORT ${app.get('port')}`);
});
// App.listen is a method coming from express
// It means the server will be listening for HTTP calls on that port