const express = require('express');
const mysql = require('mysql2/promise'); // Usa la versione promise
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');



const app = express();
const port = 3001;

// Middleware per analizzare il corpo delle richieste
app.use(bodyParser.json());
app.use(cors()); // Abilita CORS per tutte le richieste

// Connessione al database MySQL (usa direttamente la creazione della connessione)
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'login_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});






//verifica il token
const verificaToken = (req, res, next) => {
  const auth = req.headers.authorization?.split(' ');
  if (!auth || auth[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Token mancante' });
  }
  try {
    const payload = jwt.verify(auth[1], 'weshlazona');
    if (payload.userType !== 'capo') {
      return res.status(403).json({ error: 'Accesso negato' });
    }
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: 'Token non valido' });
  }
};







//VERIFICA EMAIL TRAMITE LINK
const sendVerificationEmail = (email, token) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'omix0306@gmail.com', // Usa il tuo indirizzo email
      pass: 'frvn fouu ogsq xgog' // Usa la tua password o una password per le app
    }
  });

  const mailOptions = {
    from: 'omix0306@gmail.com',
    to: email,
    subject: 'VERIFICA LA TUA EMAIL BRO',
    html: `<p>Ciao, verifica la tua email cliccando sul link sottostante:</p>
           <p><a href="http://127.0.0.1:3001/verify-email/${token}">Verifica la tua email</a></p>`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Errore nell\'invio dell\'email:', error);
    } else {
      console.log('Email inviata:', info.response);
    }
  });
};



// Post per la registrazione
app.post('/register', async (req, res) => {
  const { username, password,name,surname,email } = req.body;

  try {
    // Controlla se l'utente esiste già nel DB
    const [userExist] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
    if (userExist.length > 0) {
      return res.json({ success: false, message: 'Username già preso' });
    }

    // Cifra la password
    const hashedPassword = await bcrypt.hash(password, 10);

    // per cryptare il token per verificare l'email
    const verificationToken = jwt.sign({ email }, 'weshlazona', { expiresIn: '1h' });

    // Inserisci il nuovo utente nel DB
    const ruolo = 'dipendente'//sempre dipendente perche il capo lo aggiungo direttamente io dal db
    await db.execute('INSERT INTO users (username, password, ruolo, nome, cognome, email, is_verified ) VALUES (?, ?, ?, ?, ?, ?, ?)', [username, hashedPassword, ruolo, name, surname, email, 0]);

    // Invia l'email di verifica
    sendVerificationEmail(email, verificationToken);

    res.json({ success: true, message: 'Registrazione avvenuta con successo! Controlla la tua email per la verifica.' });
  } catch (error) {
    console.error('Errore durante la registrazione:', error);
    res.json({ success: false, message: 'Errore durante la registrazione' });
  }
});




// Rotta di login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    // Verifica se l'utente esiste nel database
    const [results] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
    if (results.length === 0) {
      return res.status(400).json({ success: false, message: 'Utente non trovato' });
    }



    const user = results[0];

    //verifico che l'utente sia verificato
    if (!user.is_verified) {
      return res.status(401).json({ success: false, message: 'Email non verificata. Controlla la tua casella di posta.' });
    }
    
  

    // Verifica la password cifrata con bcrypt
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Password errata' });
    }
    
    // Genera il token JWT
    const token = jwt.sign(
      { userId: user.id, userType: user.ruolo },  // Payload (userId e userType)
      'weshlazona',  // Chiave segreta per firmare il token
      { expiresIn: '1h' }  // Il token scade in 1 ora
    );

    res.json({
        success: true,
        token, //il token per rimanere connessi
        userType: user.ruolo,  // ruolo dell'utente (capo o dipendente)
        id: user.id,  
        message: 'Login riuscito'
      });

  } 
  //risposta in caso le credenziali siano sbagliate
  catch (err) {
    console.error('Errore durante il login:', err);
    res.status(500).json({ success: false, message: 'Errore server' });
  }
});
 


//rotta per verificare l'email tramite link
app.get('/verify-email/:token', async (req, res) => {
  const { token } = req.params;

  try {
    // Verifica il token
    const decoded = jwt.verify(token, 'weshlazona'); // Decodifica il token(weshlazona è stato utilizzato per cifrarla nel /register)
    const { email } = decoded;

    // Verifica se l'utente esiste nel DB
    const [user] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (user.length === 0) {
      return res.status(400).json({ success: false, message: 'Utente non trovato' });
    }

    // Aggiorna il campo is_verified a 1 (verificato)
    await db.execute('UPDATE users SET is_verified = 1 WHERE email = ?', [email]);

    res.redirect('http://127.0.0.1:8080/home-dipendente');
  } catch (error) {
    console.error('Errore durante la verifica dell\'email:', error);
    res.status(500).send('Errore durante la verifica dell\'email');
  }
});





// Rotta per ottenere le attività di un dipendente
app.get('/attivita/:idDipendente', async (req, res) => {
  const idDipendente = req.params.idDipendente;

  try {
    // Verifica che il dipendente esista nel database
    const [userResults] = await db.execute('SELECT * FROM users WHERE id = ?', [idDipendente]);

    if (userResults.length === 0) {
      return res.status(404).send('Dipendente non trovato');
    }

    // Recupera le attività del dipendente
    const [attivitaResults] = await db.execute('SELECT * FROM attivita WHERE id_dipendente = ?', [idDipendente]);

    // Popola i dati da inviare al frontend
    const nomeDipendente = userResults[0].username;
    const attivita = attivitaResults.map(r => ({
      id: r.id,
      nome: r.nome,
      completata: r.completata
    }));

    // Se non ci sono attività, invia comunque il nome e un array vuoto di attività
    res.json({
      nomeDipendente,
      attivita: attivitaResults.length > 0 ? attivita : []
    });

  } catch (error) {
    console.error('Errore nel recupero delle attività:', error);
    res.status(500).send('Errore nel recupero delle attività');
  }
});



// Rotta per completare un'attività (cambiare il valore di 'completata' in 1)
app.put('/completa-attivita/:idAttivita', async (req, res) => {
  const idAttivita = req.params.idAttivita;

  try {
    // Esegui la query per aggiornare l'attività
    const [results] = await db.execute('UPDATE attivita SET completata = 1 WHERE id = ?', [idAttivita]);

    if (results.affectedRows === 0) {
      return res.status(404).send('Attività non trovata');
    }
    res.json({ success: true, message: 'Attività completata con successo' });
  } catch (error) {
    console.error('Errore nell\'aggiornare l\'attività:', error);
    res.status(500).send('Errore nell\'aggiornare l\'attività');
  }
});

















const capoRouter = express.Router();

// Lista dipendenti
capoRouter.get('/dipendenti', async (req, res) => {
  const [[u]] = await db.execute(
    'SELECT id_reparto FROM users WHERE id = ?',
    [req.userId]
  );
  if (!u?.id_reparto) return res.status(400).json({ error: 'Reparto non assegnato' });

  const [dip] = await db.execute(
    'SELECT id, nome, cognome FROM users WHERE ruolo = ? AND id_reparto = ?',
    ['dipendente', u.id_reparto]
  );
  res.json(dip);
});

// Statistiche
capoRouter.get('/stats', async (req, res) => {
  const [[u]] = await db.execute('SELECT id_reparto FROM users WHERE id = ?', [req.userId]);
  const id_reparto = u?.id_reparto;
  if (!id_reparto) return res.status(400).json({ error: 'Reparto non assegnato' });

  const [[{ totalDipendenti }]] = await db.execute(
    'SELECT COUNT(*) AS totalDipendenti FROM users WHERE ruolo = ? AND id_reparto = ?',
    ['dipendente', id_reparto]
  );
  const [[{ attivitaAperte }]] = await db.execute(`
    SELECT COUNT(*) AS attivitaAperte
    FROM attivita a
    JOIN users u ON u.id = a.id_dipendente
    WHERE a.completata = 0 AND u.id_reparto = ?
  `, [id_reparto]);
  const [[{ ritardiOggi }]] = await db.execute(`
    SELECT COUNT(*) AS ritardiOggi
    FROM orari_badge b
    JOIN orari_lavoro o 
      ON b.id_dipendente = o.id_dipendente AND b.data = o.data
    JOIN users u ON u.id = b.id_dipendente
    WHERE b.ora_entrata_mattina > o.orario_inizio_mattina
      AND u.id_reparto = ? AND b.data = CURDATE()
  `, [id_reparto]);

  res.json({ totalDipendenti, attivitaAperte, ritardiOggi });
});

// Orari pianificati
capoRouter.get('/orari', async (req, res) => {
  const [[u]] = await db.execute('SELECT id_reparto FROM users WHERE id = ?', [req.userId]);
  const [rows] = await db.execute(`
    SELECT o.*, u.nome AS nomeDip, u.cognome AS cognomeDip
    FROM orari_lavoro o
    JOIN users u ON u.id = o.id_dipendente
    WHERE u.id_reparto = ?
  `, [u.id_reparto]);
  res.json(rows);
});

// Attività
capoRouter.get('/attivita', async (req, res) => {
  const [[u]] = await db.execute('SELECT id_reparto FROM users WHERE id = ?', [req.userId]);
  const [rows] = await db.execute(`
    SELECT a.*, u.nome AS nomeDip, u.cognome AS cognomeDip
    FROM attivita a
    JOIN users u ON u.id = a.id_dipendente
    WHERE u.id_reparto = ?
  `, [u.id_reparto]);
  res.json(rows);
});

// Monta tutto sotto /api/capo
app.use('/api/capo', verificaToken, capoRouter);








// Avvia il server
app.listen(port, () => {
  console.log(`Server in esecuzione su http://localhost:${port}`);
});
