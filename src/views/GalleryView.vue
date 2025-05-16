<template>
  <div class="gallery-page">
    <header class="header bg-white shadow-sm sticky-top">
      <div class="container py-3">
        <div class="row align-items-center">
          <div class="col-md-2">
            <h6 class=" mb-0">Popular</h6>
          </div>
          <div class="col-md-8">
            <div class="filters d-flex flex-nowrap overflow-auto py-1">
              <span 
                v-for="category in categories" 
                :key="category" 
                class="filter-item px-2 py-2 mx-1" 
                @click="filterCategory(category)" 
                :class="{ 'active': currentCategory === category }"
              >
                {{ category }}
              </span>
            </div>
          </div>
          <div class="col-md-2">
            <h6 class=" mb-0">Filter</h6>
          </div>
        </div>
      </div>
    </header>
    
    <main class="container py-4">
      <!-- Message d'erreur -->
      <div v-if="hasError" class="alert alert-danger" role="alert">
        <p class="mb-2">{{ errorMessage }}</p>
        <button @click="retryLoading" class="btn btn-primary">Réessayer</button>
      </div>
      
      <!-- Contenu principal -->
      <div v-else>
        <!-- Skeleton loader pendant le chargement initial -->
        <div v-if="isLoading && !photos.length" class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-4">
          <div class="col" v-for="i in 10" :key="'skeleton-'+i">
            <div class="card skeleton-card h-100">
              <div class="card-img-top skeleton-img"></div>
              <div class="card-body">
                <div class="skeleton-title"></div>
                <div class="skeleton-text mt-2"></div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Galerie d'images -->
        <div v-else>
          <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-4">
            <div class="col" v-for="photo in filteredPhotos" :key="photo.id">
              <div class="card h-100 photo-card">
                <div class="photo-container">
                  <img :src="photo.urls.small" class="card-img-top" :alt="photo.title || 'Gallery item'" />
                </div>
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-center">
                    <h6 class="card-title">{{ photo.author }}</h6>
                    <div class="d-flex align-items-center">
                      <button 
                        @click="toggleLike(photo.id)" 
                        class="btn btn-sm p-0 me-1 like-button"
                        :class="{ 'liked': photo.liked }"
                      >
                        <svg viewBox="0 0 24 24" class="heart-icon" width="20" height="20">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      </button>
                      <small class="text-muted">{{ photo.likes }} ♥ {{ photo.views }}k</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Indicateur de chargement -->
          <div v-if="isLoading" class="text-center my-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Chargement...</span>
            </div>
            <p class="mt-2 text-muted">Chargement des photos...</p>
          </div>
          
          <!-- Message de fin -->
          <div v-if="!hasMorePhotos && photos.length > 0" class="text-center my-4 py-3 border-top">
            <p class="text-muted">Vous avez atteint la fin de la galerie</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, computed, ref } from 'vue'
import { useStore } from 'vuex'

interface Photo {
  id: string;
  imageUrl: string;
  title: string;
  author: string;
  likes: number;
  views: number;
  category: string;
  liked: boolean;
}

export default defineComponent({
  name: 'GalleryView',
  
  setup() {
    const store = useStore()
    const currentCategory = ref('All')
    const categories = ['All', 'Animation', 'Branding', 'Illustration', 'Mobile', 'Print', 'Product Design', 'Typography', 'Web Design']

    const photos = computed((): Photo[] => store.getters['gallery/allPhotos'])
    const isLoading = computed(() => store.getters['gallery/isLoading'])
    const hasError = computed(() => store.getters['gallery/hasError'])
    const errorMessage = computed(() => store.getters['gallery/errorMessage'])
    const hasMorePhotos = computed(() => store.getters['gallery/hasMorePhotos'])

    const filteredPhotos = computed((): Photo[] => {
      return currentCategory.value === 'All' ? photos.value : photos.value.filter((photo: Photo) => photo.category === currentCategory.value)
    })
    
    // Fonction pour compter le nombre de photos par catégorie
    const getCategoryCount = (category: string): number => {
      return photos.value.filter((photo: Photo) => photo.category === category).length
    }

    const fetchPhotos = () => store.dispatch('gallery/fetchPhotos')
    const retryLoading = () => store.dispatch('gallery/fetchPhotos')
    const toggleLike = (photoId: string) => store.dispatch('gallery/toggleLike', photoId)
    
    // Filtrer par catégorie et animer le changement
    const filterCategory = (category: string) => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      currentCategory.value = category
    }

    onMounted(() => {
      fetchPhotos()
    })

    return {
      photos,
      isLoading,
      hasError,
      errorMessage,
      hasMorePhotos,
      filteredPhotos,
      categories,
      currentCategory,
      fetchPhotos,
      retryLoading,
      toggleLike,
      filterCategory,
      getCategoryCount
    }
  }
})
</script>

<style scoped>
.gallery-page {
  min-height: 100vh;
  background-color: #f9f9f9;
}

/* Styles personnalisés pour les filtres */
.filters {
  border-bottom: 1px solid #eee;
}

.filter-item {
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  font-size: 0.9rem;
  position: relative;
}

.filter-item.active {
  color: #0d6efd;
  border-bottom: 2px solid #0d6efd;
  font-weight: 500;
}

.filter-item:hover:not(.active) {
  color: #0a58ca;
}

/* Styles pour les cartes photo */
.photo-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
}

.photo-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
}

.photo-container {
  aspect-ratio: 4/3;
  overflow: hidden;
}

.photo-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.photo-card:hover .photo-container img {
  transform: scale(1.05);
}


.card-title {
  font-size: 0.95rem;
  margin-bottom: 0;
  font-weight: 600;
  line-height: 1.4;
}

/* Styles du bouton like */
.like-button {
  background: none;
  border: none;
  transition: transform 0.2s ease;
}

.like-button:hover {
  transform: scale(1.2);
}

.heart-icon {
  fill: #dee2e6;
  transition: fill 0.3s ease;
}

.like-button:hover .heart-icon {
  fill: #ff6b6b;
}

.like-button.liked .heart-icon {
  fill: #ff6b6b;
}

/* Styles pour les skeletons */
.skeleton-card {
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.skeleton-img {
  height: 0;
  padding-bottom: 75%; /* Ratio 4:3 */
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

.skeleton-title {
  height: 20px;
  width: 80%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}

.skeleton-text {
  height: 15px;
  width: 100%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Styles responsive additionnels pour Bootstrap */
@media (max-width: 576px) {
  .container {
    padding-left: 12px;
    padding-right: 12px;
  }
  
  .card-body {
    padding: 1rem;
  }
}
</style>