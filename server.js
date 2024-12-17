const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs'); // Importer le module 'fs' pour lire/écrire les fichiers JSON
const logements = require('./data/logement.json'); // Charger le fichier logement JSON
const usersFilePath = path.join(__dirname, 'data', 'user.json'); // Chemin vers le fichier des utilisateurs

app.use(express.json()); // Middleware pour le parsing du JSON

// Fonction pour lire les utilisateurs depuis le fichier JSON
const readUsers = () => {
  const data = fs.readFileSync(usersFilePath, 'utf8');
  return JSON.parse(data);
};

// Fonction pour écrire les utilisateurs dans le fichier JSON
const writeUsers = (users) => {
  fs.writeFileSync(usersFilePath, JSON.stringify({ users }, null, 2), 'utf8');
};

// Route de base : renvoie la page HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route pour récupérer tous les logements
app.get('/logements', (req, res) => {
  res.status(200).json(logements);
});

// Route pour récupérer un logement par ID
app.get('/logements/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const logement = logements.logements.find((l) => l.id === id);

  if (logement) {
    res.status(200).json(logement);
  } else {
    res.status(404).json({ message: 'Logement non trouvé' });
  }
});

// Route pour récupérer tous les utilisateurs
app.get('/users', (req, res) => {
    try {
      const users = readUsers(); // Lis le fichier JSON
      res.status(200).json(users); // Renvoie la réponse en JSON
    } catch (err) {
      console.error('Erreur de lecture du fichier JSON:', err);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });

// Route pour récupérer un utilisateur par ID
app.get('/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const users = readUsers();
  const user = users.users.find((u) => u.id === id);

  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404).json({ message: 'Utilisateur non trouvé' });
  }
});

// Route pour ajouter un utilisateur
app.post('/users', (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Nom d\'utilisateur, email et mot de passe sont obligatoires' });
  }

  const users = readUsers();
  const newUser = {
    id: users.users.length + 1, // Générer un ID unique
    username,
    email,
    password, // Le mot de passe doit être haché dans un projet réel, mais ici il est en clair pour l'exemple
  };

  users.users.push(newUser);
  writeUsers(users);

  res.status(201).json(newUser);
});

// Lancement du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
