<template>
    <div class="container">
      <div class="form-container">
        <h2>Login</h2>
        <form @submit.prevent="login">
        <label for="username">Username</label>
        <input type="text" v-model="username" id="username" required />

        <label for="password">Password</label>
        <input type="password" v-model="password" id="password" required />

        <button type="submit">Accedi</button>
      </form>

      <p v-if="error" class="error-message">{{ errorMessage }}</p>
      <p>Non hai un account? <router-link to="/register">Registrati</router-link></p>
    </div>
  </div>
  </template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      username: '',
      password: '',
      error: false,
      errorMessage: ''
    };
  },
  methods: {
    async login() {
      if (!this.username || !this.password) {
        this.error = true;
        this.errorMessage = 'Username e password sono obbligatori';
        return;
      }

      try {
        // Usa axios per inviare la richiesta di login
        const response = await axios.post('http://localhost:3001/login', {
          username: this.username,
          password: this.password,
        });


        if (response.data.success) {

          // Salva il token JWT nel localStorage
          localStorage.setItem('auth_token', response.data.token);
          //devo salvare il tipo per non far accedere alle pagine senza permessi
          localStorage.setItem('user_type', response.data.userType);  // Salva il tipo di utente (capo o dipendente)

          localStorage.setItem('dipendenteId', response.data.id); // 'idDipendente' è l'ID ottenuto dopo il login



          // Se il login è corretto, reindirizza alla home appropriata
          if (response.data.userType === 'capo') {
            this.$router.push('/home-capo');
          } else if (response.data.userType === 'dipendente') {
            
            this.$router.push('/home-dipendente');
          }

        } else {
          // Se il login non è valido, mostra errore
          this.error = true;
          
          this.errorMessage = response.data.message || 'Credenziali errate, riprova.';
        }
      } catch (error) {
        console.error('Errore nella richiesta di login:', error);
        // Gestione dell'errore 401
        if (error.response && error.response.status === 401) {
          this.error = true;
          this.errorMessage = error.response.data.message || 'Email non verificata, controlla la tua casella di posta.';
        } else {
          this.error = true;
          this.errorMessage = 'Si è verificato un errore. Riprova più tardi.';
        }
      }
    }

  }
};
</script>


<style src="../styles.css"></style>