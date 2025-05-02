<template>
    <div class="container">
      <!-- HEADER -->
      <header class="header">
        <div class="hamburger" @click="isMenuOpen = !isMenuOpen">
          <span :class="{ open: isMenuOpen }" />
          <span :class="{ open: isMenuOpen }" />
          <span :class="{ open: isMenuOpen }" />
        </div>
        <h1>Benvenuto, {{ nomeCapo }}</h1>
      </header>
  
      <!-- SIDE MENU -->
      <nav class="side-menu" :class="{ open: isMenuOpen }">
        <ul>
          <li @click="switchSection('dashboard')">Dashboard</li>
          <li @click="switchSection('orari')">Inserisci/Modifica Orari</li>
          <li @click="switchSection('attivita')">Gestisci Attività</li>
          <li @click="logout">Logout</li>
        </ul>
      </nav>
  
      <!-- MAIN CONTENT -->
      <main class="content">
  
        <!-- DASHBOARD BOX -->
        <section v-if="currentSection === 'dashboard'" class="box">
          <h2>Dashboard</h2>
          <p><strong>Totale dipendenti:</strong> {{ stats.totalDipendenti }}</p>
          <p><strong>Attività aperte:</strong> {{ stats.attivitaAperte }}</p>
          <p><strong>Ritardi oggi:</strong> {{ stats.ritardiOggi }}</p>
        </section>
  
        <!-- ORARI BOX -->
        <section v-else-if="currentSection === 'orari'" class="box">
          <h2>Inserisci / Modifica Orari</h2>
          <form @submit.prevent="saveOrario" class="form-grid">
            <div>
              <label for="sel-dip-orari">Dipendente</label>
              <select id="sel-dip-orari" v-model="orarioForm.id_dipendente" required>
                <option disabled value="">Seleziona dipendente</option>
                <option v-for="d in dipendenti" :key="d.id" :value="d.id">
                  {{ d.nome }} {{ d.cognome }}
                </option>
              </select>
            </div>
            <div>
              <label for="orario-data">Data</label>
              <input id="orario-data" type="date" v-model="orarioForm.data" required />
            </div>
            <div>
              <label for="inizio-mat">Inizio Mattina</label>
              <input id="inizio-mat" type="time" v-model="orarioForm.orario_inizio_mattina" />
            </div>
            <div>
              <label for="fine-mat">Fine Mattina</label>
              <input id="fine-mat" type="time" v-model="orarioForm.orario_fine_mattina" />
            </div>
            <div>
              <label for="inizio-pom">Inizio Pomeriggio</label>
              <input id="inizio-pom" type="time" v-model="orarioForm.orario_inizio_pomeriggio" />
            </div>
            <div>
              <label for="fine-pom">Fine Pomeriggio</label>
              <input id="fine-pom" type="time" v-model="orarioForm.orario_fine_pomeriggio" />
            </div>
            <div class="full-width">
              <button type="submit">Salva Orario</button>
            </div>
          </form>
  
          <h3>Elenco Orari</h3>
          <ul class="list">
            <li v-for="o in orariList" :key="o.id" class="item">
              <div>{{ formatDate(o.data) }} – {{ o.nomeDip }}:</div>
              <div>{{ o.orario_inizio_mattina || '--' }}–{{ o.orario_fine_mattina || '--' }}</div>
              <div>{{ o.orario_inizio_pomeriggio || '--' }}–{{ o.orario_fine_pomeriggio || '--' }}</div>
              <div class="actions">
                <button @click="editOrario(o)">Modifica</button>
                <button @click="deleteOrario(o.id)">Elimina</button>
              </div>
            </li>
          </ul>
        </section>
  
        <!-- ATTIVITÀ BOX -->
        <section v-else-if="currentSection === 'attivita'" class="box">
          <h2>Gestisci Attività</h2>
          <button class="add-btn" @click="showActivityForm = true">Aggiungi Attività</button>
  
          <!-- FORM MODALE -->
          <div v-if="showActivityForm" class="modal">
            <form @submit.prevent="saveAttivita" class="form-grid modal-form">
              <div>
                <label for="sel-dip-att">Dipendente</label>
                <select id="sel-dip-att" v-model="attForm.id_dipendente" required>
                  <option disabled value="">Seleziona dipendente</option>
                  <option v-for="d in dipendenti" :key="d.id" :value="d.id">
                    {{ d.nome }} {{ d.cognome }}
                  </option>
                </select>
              </div>
              <div>
                <label for="att-nome">Titolo</label>
                <input id="att-nome" v-model="attForm.nome" required />
              </div>
              <div class="full-width">
                <label for="att-descr">Descrizione</label>
                <textarea id="att-descr" v-model="attForm.descrizione"></textarea>
              </div>
              <div>
                <label for="att-scad">Scadenza</label>
                <input id="att-scad" type="date" v-model="attForm.data_scadenza" />
              </div>
              <div class="full-width actions">
                <button type="submit">Salva</button>
                <button type="button" @click="cancelAttForm">Annulla</button>
              </div>
            </form>
          </div>
  
          <ul class="list">
            <li v-for="a in attivitaList" :key="a.id" class="item">
              <div class="activity-header">
                <strong>{{ a.nome }}</strong>
                <span>(scadenza: {{ a.data_scadenza || '—' }})</span>
              </div>
              <p>{{ a.descrizione }}</p>
              <small>Assegnata a: {{ a.nomeDip }}</small>
              <div class="actions">
                <button @click="editAttivita(a)">Modifica</button>
                <button @click="deleteAttivita(a.id)">Elimina</button>
              </div>
            </li>
          </ul>
        </section>
  
      </main>
    </div>
  </template>
  
  <script>
  import axios from 'axios'
  axios.defaults.baseURL = 'http://localhost:3001'
  
  export default {
    name: 'HomeCapo',
    data() {
      return {
        nomeCapo: '',
        isMenuOpen: false,
        currentSection: 'dashboard',
        stats: { totalDipendenti: 0, attivitaAperte: 0, ritardiOggi: 0 },
        dipendenti: [],
        orarioForm: {
          id_dipendente: null,
          data: '',
          orario_inizio_mattina: '',
          orario_fine_mattina: '',
          orario_inizio_pomeriggio: '',
          orario_fine_pomeriggio: ''
        },
        orariList: [],
        showActivityForm: false,
        attForm: { id: null, nome: '', descrizione: '', data_scadenza: '', id_dipendente: null },
        attivitaList: []
      }
    },
    async mounted() {
      this.nomeCapo = localStorage.getItem('usernameCapo') || 'Capo'
      await this.switchSection('dashboard')
      await this.loadDipendenti()
    },
    methods: {
      async switchSection(sec) {
        this.currentSection = sec
        const headers = { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
        if (sec === 'dashboard') await this.loadStats(headers)
        if (sec === 'orari') await this.loadOrari(headers)
        if (sec === 'attivita') await this.loadAttivita(headers)
      },
      logout() {
        localStorage.clear()
        this.$router.push('/')
      },
      async loadDipendenti() {
        try {
          const res = await axios.get('/api/capo/dipendenti', {
            headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
          })
          this.dipendenti = res.data
        } catch (err) {
          console.error('Errore loadDipendenti:', err)
        }
      },
      async loadStats(headers) {
        try {
          const res = await axios.get('/api/capo/stats', { headers })
          this.stats = res.data
        } catch (err) {
          console.error('Errore loadStats:', err)
        }
      },
      formatDate(d) {
        return d.split('-').reverse().join('/')
      },
      async loadOrari(headers) {
        try {
          const res = await axios.get('/api/capo/orari', { headers })
          this.orariList = res.data
        } catch (err) {
          console.error('Errore loadOrari:', err)
        }
      },
      async saveOrario() {
        try {
          await axios.post('/api/capo/orari', this.orarioForm, {
            headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
          })
          this.orarioForm = {
            id_dipendente: null,
            data: '',
            orario_inizio_mattina: '',
            orario_fine_mattina: '',
            orario_inizio_pomeriggio: '',
            orario_fine_pomeriggio: ''
          }
          await this.loadOrari({
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`
          })
        } catch (err) {
          console.error('Errore saveOrario:', err)
        }
      },
      editOrario(o) {
        this.orarioForm = { ...o }
      },
      async deleteOrario(id) {
        try {
          await axios.delete(`/api/capo/orari/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
          })
          await this.loadOrari({
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`
          })
        } catch (err) {
          console.error('Errore deleteOrario:', err)
        }
      },
      async loadAttivita(headers) {
        try {
          const res = await axios.get('/api/capo/attivita', { headers })
          this.attivitaList = res.data
        } catch (err) {
          console.error('Errore loadAttivita:', err)
        }
      },
      editAttivita(a) {
        this.attForm = { ...a }
        this.showActivityForm = true
      },
      cancelAttForm() {
        this.attForm = { id: null, nome: '', descrizione: '', data_scadenza: '', id_dipendente: null }
        this.showActivityForm = false
      },
      async saveAttivita() {
        try {
          const headers = { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
          if (this.attForm.id) {
            await axios.put(`/api/capo/attivita/${this.attForm.id}`, this.attForm, { headers })
          } else {
            await axios.post('/api/capo/attivita', this.attForm, { headers })
          }
          this.cancelAttForm()
          await this.loadAttivita(headers)
        } catch (err) {
          console.error('Errore saveAttivita:', err)
        }
      },
      async deleteAttivita(id) {
        try {
          await axios.delete(`/api/capo/attivita/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
          })
          await this.loadAttivita({
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`
          })
        } catch (err) {
          console.error('Errore deleteAttivita:', err)
        }
      }
    }
  }
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
    padding: 1.5rem;
    text-align: center;
    font-size: 2rem;
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
    height: 30px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    cursor: pointer;
    z-index: 2000;
  }
  .hamburger span {
    display: block;
    height: 3px;
    background: white;
    border-radius: 2px;
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
  .content {
    flex: 1;
    padding: 2rem;
    margin-top: 1rem;
  }
  .box {
    background: white;
    color: black;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit,minmax(200px,1fr));
    gap: 1rem;
    margin-bottom: 1rem;
  }
  .form-grid .full-width {
    grid-column: 1 / -1;
    text-align: right;
  }
  .list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .item {
    background: var(--midnight-green-3);
    padding: 0.8rem;
    border-radius: 5px;
    margin-bottom: 0.8rem;
    font-family: 'Montserrat', sans-serif;
  }
  .actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
  .add-btn {
    margin-bottom: 1rem;
  }
  .modal {
    background: rgba(0,0,0,0.5);
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .modal-form {
    background: white;
    color: black;
    border-radius: 8px;
    padding: 2rem;
    width: 90%;
    max-width: 500px;
  }
  .activity-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fade-in {
    animation: fadeIn 0.5s ease forwards;
  }
  </style>
  