<template>
  <div class="container">
    <!-- Header con hamburger e benvenuto -->
    <header class="header">
      <div class="hamburger" @click="toggleMenu">
        <span :class="{ open: isMenuOpen }"></span>
        <span :class="{ open: isMenuOpen }"></span>
        <span :class="{ open: isMenuOpen }"></span>
      </div>
      <h1>Benvenuto, {{ nomeDipendente }}</h1>
    </header>


    <!-- Menu laterale -->
    <nav class="side-menu" :class="{ open: isMenuOpen }">
      <ul>
        <li @click="toggleMenu">Attività</li>
        <li @click="logout">Logout</li>
      </ul>
    </nav>

    <!-- Contenuto principale -->
    <main class="content">
      <h3>Oggi ci sono da fare le seguenti attività:</h3>
      <ul>
        <li v-for="(att, i) in attivitaGiornata" :key="att.id" class="fade-in">
          <span>{{ att.nome }}</span>
          <button @click="completaAttivita(i)" :disabled="att.completata">
            {{ att.completata ? 'Completata' : 'Completa' }}
          </button>
        </li>
      </ul>
      <p v-if="!attivitaGiornata.length">Nessuna attività da completare oggi.</p>
    </main>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'HomeDipendente',
  data() {
    return {
      nomeDipendente: '',
      attivitaGiornata: [],
      isMenuOpen: false
    };
  },
  async mounted() {
    // caricamento nome e attività
    const dipId = localStorage.getItem('dipendenteId');
    if (!dipId) return this.$router.push('/login');
    // load name
    try {
      const res = await axios.get(`http://localhost:3001/attivita/${dipId}`);
      this.nomeDipendente = res.data.nomeDipendente;
      this.attivitaGiornata = res.data.attivita.filter(a => !a.completata);
    } catch (e) {
      console.error(e);
    }
  },
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },
    async completaAttivita(idx) {
      const att = this.attivitaGiornata[idx];
      try {
        const res = await axios.put(`http://localhost:3001/completa-attivita/${att.id}`);
        if (res.data.success) this.attivitaGiornata.splice(idx, 1);
      } catch (e) { console.error(e); }
    },
    logout() {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_type');
      localStorage.removeItem('dipendenteId');
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--prussian-blue);
  color: white;
}

.header {
  background-color: var(--midnight-green);
  color: var(--midnight-green); /* Colore del testo uguale allo sfondo */
  padding: 1.5rem;
  text-align: center;
  font-size: 2rem; /* Aumentato per renderlo più grande */
  font-family: 'Montserrat', sans-serif;
  border-radius: 5px;
  margin-bottom: 2rem;
  width: 100%;
}


.header h1 {
  margin: 0 auto;
  font-size: 1.5rem;
  font-family: 'Montserrat', sans-serif;
  color: aliceblue;
}




.hamburger {
  position: fixed !important;
  top: 1rem !important;
  left: 1rem !important;
  width: 30px;
  height: 30px;            /* aumentato da 24px a 40px */
  display: flex;
  flex-direction: column;
  justify-content: space-between;  /* usa space-between per più distanza */
  cursor: pointer;
  z-index: 2000;
}

.hamburger span {
  display: block;
  height: 3px;
  background: white;
  border-radius: 2px;
  /* rimuovi margini, lo spacing lo gestisce justify-content */
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.hamburger span.open:nth-child(1) {
  transform: translateY(10px) rotate(45deg);
}
.hamburger span.open:nth-child(2) {
  opacity: 0;
}
.hamburger span.open:nth-child(3) {
  transform: translateY(-10px) rotate(-45deg);
}

/* MENU LATERALE */
.side-menu {
  position: fixed;
  top: 0;
  left: 0;
  width: 220px;
  height: 100%;
  background: var(--midnight-green-2);
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  padding-top: 4rem;
  z-index: 1500;
}

.side-menu.open {
  transform: translateX(0);
}

.side-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.side-menu li {
  padding: 1rem;
  text-align: center;
  font-family: 'Montserrat', sans-serif;
  cursor: pointer;
  transition: background 0.2s ease;
}

.side-menu li:hover {
  background: var(--caribbean-current);
}

/* CONTENUTO */
.content {
  flex: 1;
  padding: 2rem;
  margin-top: 1rem;
}

.content h3 {
  font-family: 'Montserrat', sans-serif;
  margin-bottom: 1rem;
  text-align: center;
}

/* LISTA ATTIVITÀ */
ul {
  list-style: none;
  padding: 0;
  margin: 0 auto;
  max-width: 400px;
}

li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--midnight-green-3);
  padding: 0.8rem 1rem;
  border-radius: 5px;
  margin-bottom: 0.8rem;
  font-family: 'Montserrat', sans-serif;
}

li button {
  background: var(--caribbean-current);
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  transition: background 0.2s ease;
}

li button:hover {
  background: var(--midnight-green);
}

/* ANIMAZIONE INGRESO */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
.fade-in {
  animation: fadeIn 0.5s ease forwards;
}
</style>
