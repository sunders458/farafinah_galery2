<template>
  <div class="gallery-page">
    <header class="header">
      <div class="container">
        <div class="header-content">
          <h1>Galerie Photos</h1>
          <div class="user-menu">
            <span class="username" v-if="currentUser">{{ currentUser.username }}</span>
            <button @click="logout" class="btn btn-outline">Déconnexion</button>
          </div>
        </div>
      </div>
    </header>
    
    <main class="gallery-content container">
      <!-- Messages d'erreur -->
      <div v-if="hasError" class="error-message">
        <p>{{ errorMessage }}</p>
        <button @click="retryLoading" class="btn btn-primary">Réessayer</button>
      </div>
      
      <!-- Galerie de photos -->
      <div v-else class="gallery-grid">
        <!-- Skeleton loaders pour le chargement initial -->
        <div v-if="isLoading && !photos.length" class="skeleton-container">
          <div class="skeleton-card" v-for="i in 12" :key="'skeleton-'+i"></div>
        </div>
        
        <!-- Photos réelles -->
        <div v-else>
          <div 
            v-for="photo in photos" 
            :key="photo.id" 
            class="photo-card card"
          >
            <div class="photo-container">
              <img 
                :src="photo.urls.small" 
                :alt="photo.alt_description || 'Unsplash photo'"
                @load="onPhotoLoad(photo.id)"
                :class="{'loading': !loadedPhotos[photo.id]}"
              />
              <div v-if="!loadedPhotos[photo.id]" class="photo-loading"></div>
            </div>
            
            <div class="photo-info">
              <p class="photo-author">{{ photo.user.name }}</p>
              <button 
                @click="toggleLike(photo.id)" 
                :class="['like-button', { 'liked': photo.liked }]"
                aria-label="Like photo"
              >
                <svg viewBox="0 0 24 24" class="heart-icon">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Indicateur de chargement en bas pour le scroll infini -->
          <div v-if="isLoading" class="loading-more">
            <div class="spinner"></div>
            <span>Chargement des photos...</span>
          </div>
          
          <!-- Message de fin -->
          <div v-if="!hasMorePhotos && photos.length > 0" class="end-message">
            <p>Vous avez atteint la fin de la galerie</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, computed, ref, onUnmounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'

export default defineComponent({
  name: 'GalleryView',
  
  setup() {
    const store = useStore()
    const router = useRouter()
    const toast = useToast()
    
    const loadedPhotos = ref<Record<string, boolean>>({})
    const observer = ref<IntersectionObserver | null>(null)
    const loadingTrigger = ref<HTMLElement | null>(null)
    
    const photos = computed(() => store.getters['gallery/allPhotos'])
    const isLoading = computed(() => store.getters['gallery/isLoading'])
    const hasError = computed(() => store.getters['gallery/hasError'])
    const errorMessage = computed(() => store.getters['gallery/errorMessage'])
    const hasMorePhotos = computed(() => store.getters['gallery/hasMorePhotos'])
    const currentUser = computed(() => store.getters['auth/currentUser'])
    
    // Mark a photo as loaded once its image is downloaded
    const onPhotoLoad = (photoId: string) => {
      loadedPhotos.value[photoId] = true
    }
    
    // Fetch initial photos
    const fetchPhotos = () => {
      store.dispatch('gallery/fetchPhotos')
    }
    
    // Retry loading after error
    const retryLoading = () => {
      store.dispatch('gallery/fetchPhotos')
    }
    
    // Toggle like for a photo
    const toggleLike = (photoId: string) => {
      store.dispatch('gallery/toggleLike', photoId)
    }
    
    // Logout
    const logout = () => {
      store.dispatch('auth/logout')
      router.push('/login')
      toast.success('Vous avez été déconnecté')
    }
    
    // Setup intersection observer for infinite scrolling
    const setupInfiniteScroll = () => {
      observer.value = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !isLoading.value && hasMorePhotos.value) {
          fetchPhotos()
        }
      }, { threshold: 0.5 })
      
      if (loadingTrigger.value) {
        observer.value.observe(loadingTrigger.value)
      }
    }
    
    onMounted(() => {
      // Fetch photos and user likes
      fetchPhotos()
      store.dispatch('gallery/loadUserLikes')
      
      // Watch for .loading-more element to appear in the DOM for infinite scroll
      watch(
        () => document.querySelector('.loading-more'),
        (el) => {
          if (el && !loadingTrigger.value) {
            loadingTrigger.value = el as HTMLElement
            setupInfiniteScroll()
          }
        },
        { immediate: true }
      )
      
      // For initial footer visibility without photos
      const setupInitialObserver = () => {
        const footer = document.createElement('div')
        footer.className = 'scroll-trigger'
        footer.style.height = '10px'
        footer.style.width = '100%'
        document.querySelector('.gallery-grid')?.appendChild(footer)
        
        const initialObserver = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting && !isLoading.value && hasMorePhotos.value) {
            fetchPhotos()
          }
        })
        
        initialObserver.observe(footer)
        
        // Cleanup after first photos are loaded
        watch(photos, (newPhotos) => {
          if (newPhotos.length > 0) {
            initialObserver.disconnect()
            footer.remove()
          }
        })
      }
      
      setupInitialObserver()
    })
    
    onUnmounted(() => {
      if (observer.value && loadingTrigger.value) {
        observer.value.unobserve(loadingTrigger.value)
        observer.value.disconnect()
      }
    })
    
    return {
      photos,
      isLoading,
      hasError,
      errorMessage,
      hasMorePhotos,
      currentUser,
      loadedPhotos,
      onPhotoLoad,
      fetchPhotos,
      retryLoading,
      toggleLike,
      logout
    }
  }
})
</script>

<style scoped>
.gallery-page {
  min-height: 100vh;
  background-color: var(--background-color);
  padding-bottom: 50px;
}

.header {
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 15px 0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h1 {
  font-size: 1.5rem;
  color: var(--secondary-color);
  margin: 0;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 15px;
}

.username {
  font-weight: 600;
  color: var(--secondary-color);
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-outline:hover {
  background-color: var(--primary-color);
  color: white;
}

.gallery-content {
  padding-top: 30px;
}

.error-message {
  background-color: rgba(231, 76, 60, 0.1);
  border-left: 4px solid var(--error-color);
  padding: 20px;
  border-radius: 4px;
  margin: 20px 0;
  text-align: center;
}

.error-message p {
  margin-bottom: 15px;
  color: var(--error-color);
  font-weight: 500;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 20px 0;
}

.photo-card {
  overflow: hidden;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.photo-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.photo-container {
  position: relative;
  aspect-ratio: 4/3;
  overflow: hidden;
  background-color: #f5f5f5;
}

.photo-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.5s ease;
}

.photo-container img.loading {
  opacity: 0;
}

.photo-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.photo-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
}

.photo-author {
  font-size: 0.9rem;
  margin: 0;
  color: var(--secondary-color);
  font-weight: 500;
}

.like-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  transition: transform 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.like-button:hover {
  transform: scale(1.1);
}

.heart-icon {
  width: 24px;
  height: 24px;
  fill: #ddd;
  transition: fill 0.3s ease, transform 0.3s ease;
}

.like-button:hover .heart-icon {
  fill: #ff6b6b;
}

.like-button.liked .heart-icon {
  fill: #ff6b6b;
  animation: pulse 0.4s;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.loading-more {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  color: #666;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(66, 185, 131, 0.2);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.end-message {
  grid-column: 1 / -1;
  text-align: center;
  padding: 20px 0;
  color: #666;
  border-top: 1px solid #eee;
  margin-top: 20px;
}

/* Skeleton cards pour le chargement */
.skeleton-container {
  display: contents;
}

.skeleton-card {
  height: 0;
  padding-bottom: calc(3 / 4 * 100%); /* Maintient le ratio 4:3 */
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 8px;
}

/* Responsive styles */
@media (max-width: 768px) {
  .gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 15px;
  }
  
  .header h1 {
    font-size: 1.2rem;
  }
  
  .user-menu {
    gap: 10px;
  }
  
  .username {
    display: none; /* Cache le nom d'utilisateur sur mobile */
  }
}

@media (max-width: 480px) {
  .gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 10px;
  }
  
  .photo-info {
    padding: 10px;
  }
  
  .photo-author {
    font-size: 0.8rem;
  }
  
  .heart-icon {
    width: 20px;
    height: 20px;
  }
}
</style>