<template>
  <div class="home">
    <div class="hero">
      <div class="container">
        <h1>Farafinah Gallery</h1>
        <p>Une galerie d'images Unsplash avec système de likes personnalisé</p>
        <div class="cta-buttons">
          <router-link to="/login" class="btn btn-primary">Se connecter</router-link>
          <router-link to="/gallery" class="btn btn-outline">Voir la galerie</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'HomeView',

  setup() {
    const store = useStore();
    const router = useRouter();

    onMounted(() => {
      // Check if user is already authenticated
      store.dispatch('auth/checkAuth');
      const isAuthenticated = store.getters['auth/isAuthenticated'];
      
      // Redirect to gallery if authenticated
      if (isAuthenticated) {
        router.push('/gallery');
      }
    });
  }
});
</script>

<style scoped>
.home {
  min-height: 100vh;
}

.hero {
  height: 100vh;
  display: flex;
  align-items: center;
  text-align: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.hero h1 {
  font-size: 3rem;
  color: var(--secondary-color);
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.cta-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-outline:hover {
  background-color: var(--primary-color);
  color: white;
}

/* Animation d'entrée */
.hero {
  animation: fadeIn 1s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive styles */
@media (max-width: 768px) {
  .hero h1 {
    font-size: 2.5rem;
  }
  
  .hero p {
    font-size: 1rem;
    padding: 0 20px;
  }
}

@media (max-width: 480px) {
  .hero h1 {
    font-size: 2rem;
  }
  
  .cta-buttons {
    flex-direction: column;
    gap: 10px;
    padding: 0 20px;
  }
  
  .btn {
    width: 100%;
  }
}
</style>