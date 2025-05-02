<template>
  <div class="container">
    <div class="form-container">
      <h2>Registrazione</h2>
      <form @submit.prevent="register">
        <label for="username">Username</label>
        <input type="text" v-model="username" id="username" required />

        <label for="username">Name</label>
        <input type="text" v-model="name" id="name" required />


        <label for="username">Surname</label>
        <input type="text" v-model="surname" id="surname" required />

        <label for="username">Email</label>
        <input type="text" v-model="email" id="email" required />

        <label for="password">Password</label>
        <input type="password" v-model="password" id="password" required />

        <button type="submit">Registrati</button>
      </form>

      <p v-if="error" style="color: red;">Si è verificato un errore, riprova.</p>
      <p>Hai già un account? <router-link to="/login">Accedi</router-link></p>
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
      name: '',
      surname:  '',
      email:  '',
      error: false // Variabile per gestire gli errori
    };
  },
  methods: {
    async register() {
      try {
        // Invia i dati al backend per la registrazione
        const response = await axios.post('http://localhost:3001/register', {
          username: this.username,
          password: this.password,
          name:     this.name,
          surname:  this.surname,
          email:    this.email,
        });

        if (response.data.success) {
            // Se la registrazione è riuscita, mostra il messaggio di successo
            this.registrationSuccess = true;
            // Imposta nel localStorage per far sapere che la registrazione è stata completata
            localStorage.setItem('registrationSuccess', 'true');
            setTimeout(() => {
              this.$router.push('/login');
            }, 2000);
        } else {
          // Se c'è stato un errore, mostra un messaggio di errore
          this.error = true;
        }
      } catch (error) {
        console.error('Errore nella richiesta di registrazione:', error);
        this.error = true;
      }
    }
  }
};
</script>


<style src="../styles.css"></style>