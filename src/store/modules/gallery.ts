import { Module } from 'vuex'
import axios from 'axios'
import localforage from 'localforage'

interface Photo {
  id: string;
  urls: {
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string;
  user: {
    name: string;
  };
  liked?: boolean;
}

interface GalleryState {
  photos: Photo[];
  loading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
}

// Configure localforage
localforage.config({
  name: 'unsplash-gallery',
  storeName: 'user_likes'
})

const galleryModule: Module<GalleryState, any> = {
  namespaced: true,
  
  state: {
    photos: [],
    loading: false,
    error: null,
    page: 1,
    hasMore: true
  },
  
  getters: {
    allPhotos(state) {
      return state.photos
    },
    isLoading(state) {
      return state.loading
    },
    hasError(state) {
      return !!state.error
    },
    errorMessage(state) {
      return state.error
    },
    hasMorePhotos(state) {
      return state.hasMore
    }
  },
  
  mutations: {
    setPhotos(state: GalleryState, photos: Photo[]) {
      state.photos = photos
    },
    addPhotos(state: GalleryState, photos: Photo[]) {
      state.photos = [...state.photos, ...photos]
    },
    setLoading(state: GalleryState, status: boolean) {
      state.loading = status
    },
    setError(state: GalleryState, error: string | null) {
      state.error = error
    },
    incrementPage(state: GalleryState) {
      state.page += 1
    },
    setHasMore(state: GalleryState, status: boolean) {
      state.hasMore = status
    },
    toggleLike(state: GalleryState, photoId: string) {
      const photoIndex = state.photos.findIndex(p => p.id === photoId)
      if (photoIndex !== -1) {
        const photo = state.photos[photoIndex]
        state.photos[photoIndex] = {
          ...photo,
          liked: !photo.liked
        }
      }
    },
    setPhotoLikes(state: GalleryState, { likedPhotoIds }: { likedPhotoIds: string[] }) {
      state.photos = state.photos.map(photo => ({
        ...photo,
        liked: likedPhotoIds.includes(photo.id)
      }))
    }
  },
  
  actions: {
    async fetchPhotos({ commit, state, rootGetters }: { commit: any; state: GalleryState; rootGetters: any }) {
      if (state.loading || !state.hasMore) return
      
      commit('setLoading', true)
      commit('setError', null)
      
      try {
        const username = rootGetters['auth/currentUser']?.username
        const response = await axios.get('https://api.unsplash.com/photos', {
          params: {
            page: state.page,
            per_page: 20,
            order_by: 'latest'
          },
          headers: {
            'Authorization': `Client-ID ${process.env.VUE_APP_UNSPLASH_ACCESS_KEY}`
          }
        })
        
        const photos = response.data as Photo[]
        
        // Get liked photos from IndexedDB for current user
        if (username) {
          const likedPhotoIds = await localforage.getItem<string[]>(`likes_${username}`) || []
          photos.forEach((photo: Photo) => {
            photo.liked = likedPhotoIds.includes(photo.id)
          })
        }
        
        // Ajouter des attributs supplémentaires aux photos
        const categories = ['Animation', 'Branding', 'Illustration', 'Mobile', 'Print', 'Product Design', 'Typography', 'Web Design']
        photos.forEach((photo: any) => {
          // Ajouter une catégorie aléatoire
          photo.category = categories[Math.floor(Math.random() * categories.length)]
          
          // Générer un titre si manquant
          photo.title = photo.alt_description || `Photo ${photo.id.substring(0, 6)}`
          
          // Ajouter auteur
          photo.author = photo.user?.name || 'Unknown artist'
          
          // Ajouter des statistiques fictives si nécessaire
          photo.likes = photo.likes || Math.floor(Math.random() * 500)
          photo.views = photo.views || Math.floor(Math.random() * 50) + 1
        })
        
        if (photos.length === 0) {
          commit('setHasMore', false)
        } else {
          if (state.page === 1) {
            commit('setPhotos', photos)
          } else {
            commit('addPhotos', photos)
          }
          commit('incrementPage')
        }
      } catch (error) {
        commit('setError', 'Erreur lors du chargement des photos')
        console.error('Error fetching photos:', error)
      } finally {
        commit('setLoading', false)
      }
    },
    
    async toggleLike({ commit, rootGetters }: { commit: any; rootGetters: any }, photoId: string) {
      const username = rootGetters['auth/currentUser']?.username
      if (!username) return
      
      commit('toggleLike', photoId)
      
      try {
        // Get current likes for user
        const likedPhotoIds = await localforage.getItem<string[]>(`likes_${username}`) || []
        
        // Toggle like status
        const isLiked = likedPhotoIds.includes(photoId)
        let updatedLikes: string[]
        
        if (isLiked) {
          updatedLikes = likedPhotoIds.filter(id => id !== photoId)
        } else {
          updatedLikes = [...likedPhotoIds, photoId]
        }
        
        // Save updated likes
        await localforage.setItem(`likes_${username}`, updatedLikes)
      } catch (error) {
        console.error('Error toggling like:', error)
        // Revert UI change if storage fails
        commit('toggleLike', photoId)
      }
    },
    
    async loadUserLikes({ commit, rootGetters }: { commit: any; rootGetters: any }) {
      const username = rootGetters['auth/currentUser']?.username
      if (!username) return
      
      try {
        const likedPhotoIds = await localforage.getItem<string[]>(`likes_${username}`) || []
        commit('setPhotoLikes', { likedPhotoIds })
      } catch (error) {
        console.error('Error loading user likes:', error)
      }
    },
    
    resetGallery({ commit, state }: { commit: any; state: GalleryState }) {
      commit('setPhotos', [])
      commit('setLoading', false)
      commit('setError', null)
      commit('setHasMore', true)
      state.page = 1 // Directly reset the page since there's no setPage mutation
    }
  }
}

export default galleryModule