const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

// Middleware pour parser les requêtes JSON
app.use(express.json());

// Servir les fichiers statiques depuis le dossier "static"
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'CSS')));


app.set('view engine', 'ejs');

const userFile = path.join(__dirname, '/baseDD/user.json');
const logementFile = path.join(__dirname, '/baseDD/logement.json');
// Lire le fichier JSON des utilisateurs
const readUsers = () => {
  const rawbaseDD = fs.readFileSync('./baseDD/user.json');
  return JSON.parse(rawbaseDD);
};

// Lire le fichier JSON des logements
const readLogements = () => {
  const baseDD = fs.readFileSync(logementFile, 'utf8');
  return JSON.parse(baseDD);
};

// Route principale : Page d'accueil (HTML)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const users = readUsers();
    const user = users.find(u => u.username === username);

    if (!user) {
      return res.render('login', { error: 'Nom d’utilisateur incorrect.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render('login', { error: 'Mot de passe incorrect.' });
    }

    // Authentification réussie
    res.render('dashboard', { username });
  } catch (error) {
    console.error("Erreur de lecture du fichier :", error);
    res.status(500).send("Erreur serveur.");
  }
});

app.get('/newaccount', (req, res) => {
  res.render('newaccount', { error: null, success: null });
});

app.post('/newaccount', async (req, res) => {
  const { username, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.render('newaccount', { error: 'Les mots de passe ne correspondent pas.', success: null });
  }

  try {
    const users = readUsers();
    const userExists = users.find(u => u.username === username);

    if (userExists) {
      return res.render('newaccount', { error: 'Le nom d’utilisateur existe déjà.', success: null });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: users.length + 1, username, password: hashedPassword };

    users.push(newUser);
    fs.writeFileSync(userFile, JSON.stringify(users, null, 2));

    res.render('newaccount', { error: null, success: 'Compte créé avec succès. Vous pouvez vous connecter.' });
  } catch (error) {
    console.error("Erreur lors de la création du compte :", error);
    res.status(500).send("Erreur serveur.");
  }
});

// Route pour obtenir tous les utilisateurs
app.get('/users', (req, res) => {
  const users = readUsers();
  res.status(200).json(users);
});

// Route pour obtenir un utilisateur par son ID
app.get('/users/:id', (req, res) => {
  const users = readUsers();
  const user = users.find(u => u.id == req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }
  res.status(200).json(user);
});

// Route pour ajouter un utilisateur
app.post('/users', (req, res) => {
  const users = readUsers();
  const newUser = req.body;
  users.push(newUser);
  fs.writeFileSync('./user.json', JSON.stringify(users, null, 2));
  res.status(201).json(newUser);
});

// Route pour obtenir tous les logements
app.get('/elements', (req, res) => {
  const logements = readLogements();
  res.status(200).json(logements);
});

// Route pour obtenir un logement par ID
app.get('/elements/:id', (req, res) => {
  const logements = readLogements();
  //console.log(logements)
  const logement = logements.find(l => l.id == req.params.id);
  if (!logement) {
    return res.status(404).json({ message: 'Logement non trouvé' });
  }
  res.status(200).json(logement);
});

// Route pour ajouter un logement
app.post('/elements', (req, res) => {
  const logements = readLogements();
  const newLogement = req.body;
  logements.push(newLogement);
  fs.writeFileSync('./baseDD/logements.json', JSON.stringify(logements, null, 2));
  res.status(201).json(newLogement);
});

// Route pour modifier un logement par ID
app.put('/elements/:id', (req, res) => {
  const logements = readLogements();
  const index = logements.findIndex(l => l.id == req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Logement non trouvé' });
  }
  logements[index] = { ...logements[index], ...req.body };
  fs.writeFileSync('./baseDD/logements.json', JSON.stringify(logements, null, 2));
  res.status(200).json(logements[index]);
});

// Route pour supprimer un logement par ID
app.delete('/elements/:id', (req, res) => {
  const logements = readLogements();
  const index = logements.findIndex(l => l.id == req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Logement non trouvé' });
  }
  logements.splice(index, 1);
  fs.writeFileSync('./baseDD/logements.json', JSON.stringify(logements, null, 2));
  res.status(200).json({ message: 'Logement supprimé' });
});

//erreur 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route inconnue' });
});

// lancement serveur 
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});