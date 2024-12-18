const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

app.use(express.json());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'CSS')));


app.set('view engine', 'ejs');

const userFile = path.join(__dirname, '/baseDD/user.json');
const logementFile = path.join(__dirname, '/baseDD/logement.json');


const readUsers = () => {
  const rawbaseDD = fs.readFileSync('./baseDD/user.json');
  return JSON.parse(rawbaseDD);
};


const readLogements = () => {
  const baseDD = fs.readFileSync(logementFile, 'utf8');
  return JSON.parse(baseDD);
};


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});


app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

//[ ] Présence d’un mécanisme d’authentification
app.post('/login', async (req, res) => {
  const { nomU, mdp } = req.body;

  try {
    const users = readUsers();
    const user = users.find(u => u.nomU === nomU);

    if (!user) {
      //[ ] 401 en cas d’accès non authentifié
      res.status(401).send("accès non authentifié");
      return res.render('login', { error: 'Nom d’utilisateur incorrect.' });
    }

    const compare = await bcrypt.compare(mdp, user.mdp);
    if (!compare) {
      res.status(401).send("accès non authentifié");
      return res.render('login', { error: 'Mot de passe incorrect.' });
    }

 
    res.render('dashboard', { nomU });
  } catch (error) {
    console.error("Erreur de lecture du fichier :", error);
    res.status(500).send("Erreur serveur.");
  }
});

app.get('/newaccount', (req, res) => {
  res.render('newaccount', { error: null, success: null });
});

//[ ] le POST /elements ajoute des données à la base de données
//[ ] Possibilité de créer un compte utilisateur de compte
app.post('/newaccount', async (req, res) => {
  const { nomU, mdp, confirmMDP } = req.body;

  if (mdp !== confirmMDP) {
    return res.render('newaccount', { error: 'Les mots de passe ne correspondent pas.', success: null });
  }

  try {
    const users = readUsers();
    const userExists = users.find(u => u.nomU === nomU);

    if (userExists) {
      return res.render('newaccount', { error: 'Le nom d’utilisateur existe déjà.', success: null });
    }

    const hashedPassword = await bcrypt.hash(mdp, 10);
    const newUser = { id: users.length + 1, nomU, mdp: hashedPassword };

    users.push(newUser);
    fs.writeFileSync(userFile, JSON.stringify(users, null, 2));

    res.render('login', { error: null, success: 'Compte créé avec succès. Vous pouvez vous connecter.' });

  } catch (error) {
    console.error("Erreur lors de la création du compte :", error);
    res.status(500).send("Erreur serveur.");
  }
});


app.get('/users', (req, res) => {
  const users = readUsers();
  res.status(200).json(users);
});


app.get('/users/:id', (req, res) => {
  const users = readUsers();
  const user = users.find(u => u.id == req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }
  res.status(200).json(user);
});


app.post('/users', (req, res) => {
  const users = readUsers();
  const newUser = req.body;
  users.push(newUser);
  fs.writeFileSync('./user.json', JSON.stringify(users, null, 2));
  res.status(201).json(newUser);
});

// [ ] Le GET /elements renvoie une liste
app.get('/elements', (req, res) => {
  const logements = readLogements();
  res.status(200).json(logements);
});

// [ ] Le GET /elements/un-id renvoie un élément en détail
app.get('/elements/:id', (req, res) => {
  const logements = readLogements();

  const logement = logements.find(l => l.id == req.params.id);
  if (!logement) {
    return res.status(404).json({ message: 'Logement non trouvé' });
  }
  //[ ] GET en 200
  res.status(200).json(logement);
});


app.post('/elements', (req, res) => {
  const logements = readLogements();
  const newLogement = req.body;
  logements.push(newLogement);
  fs.writeFileSync('./baseDD/logement.json', JSON.stringify(logements, null, 2));
  res.status(201).json(newLogement);
});

// [ ] PUT ou PATCH /elements/un-id qui l’enregistrement
app.put('/elements/:id', (req, res) => {
  const logements = readLogements();
  const index = logements.findIndex(l => l.id == req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Logement non trouvé' });
  }
  logements[index] = { ...logements[index], ...req.body };
  fs.writeFileSync('./baseDD/logement.json', JSON.stringify(logements, null, 2));
  res.status(200).json(logements[index]);
});

//[ ] DELETE /elements/un-id qui supprime un enregistrement
app.delete('/elements/:id', (req, res) => {
  const logements = readLogements();
  const index = logements.findIndex(l => l.id == req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Logement non trouvé' });
  }
  logements.splice(index, 1);
  fs.writeFileSync('./baseDD/logement.json', JSON.stringify(logements, null, 2));
  res.status(200).json({ message: 'Logement supprimé' });
});

// [ ] 404 en cas de route inconnue et en cas d’enregistrement inconnu
app.use((req, res) => {
  res.status(404).json({ message: 'Route inconnue' });
});

// [ ] Serveur express qui se lance
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});