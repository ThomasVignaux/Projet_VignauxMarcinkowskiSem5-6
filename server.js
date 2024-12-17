const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

// Middleware pour parser les requêtes JSON
app.use(express.json());

// Servir les fichiers statiques depuis le dossier "static"
app.use(express.static(path.join(__dirname, 'static')));

// Lire le fichier JSON des utilisateurs
const readUsers = () => {
  const rawData = fs.readFileSync('./user.json');
  return JSON.parse(rawData);
};

// Lire le fichier JSON des logements
const readLogements = () => {
  const rawData = fs.readFileSync('./data/logements.json');
  return JSON.parse(rawData);
};

// Route principale : Page d'accueil (HTML)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
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
  fs.writeFileSync('./data/logements.json', JSON.stringify(logements, null, 2));
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
  fs.writeFileSync('./data/logements.json', JSON.stringify(logements, null, 2));
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
  fs.writeFileSync('./data/logements.json', JSON.stringify(logements, null, 2));
  res.status(200).json({ message: 'Logement supprimé' });
});

// Middleware pour les routes non définies
app.use((req, res) => {
  res.status(404).json({ message: 'Route inconnue' });
});

// Lancer le serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
