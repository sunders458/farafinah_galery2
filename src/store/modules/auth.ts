import { Module } from 'vuex'

interface User {
  username: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const authModule: Module<AuthState, any> = {
  namespaced: true,
  
  state: {
    user: null,
    isAuthenticated: false
  },
  
  getters: {
    isAuthenticated(state: AuthState): boolean {
      return state.isAuthenticated
    },
    currentUser(state: AuthState): User | null {
      return state.user
    }
  },
  
  mutations: {
    setUser(state: AuthState, user: User | null) {
      state.user = user
      state.isAuthenticated = !!user
    },
    logout(state: AuthState) {
      state.user = null
      state.isAuthenticated = false
    }
  },
  
  actions: {
    login({ commit }, { username, password }: { username: string; password: string }) {
      return new Promise<User>((resolve, reject) => {
        // Simulate API call with mock authentication
        setTimeout(() => {
          // Check credentials against mock users
          if (username === 'muser1' && password === 'mpassword1') {
            const user: User = { username }
            commit('setUser', user)
            // Store in localStorage for persistence
            localStorage.setItem('user', JSON.stringify(user))
            resolve(user)
          } else if (username === 'muser2' && password === 'mpassword2') {
            const user: User = { username }
            commit('setUser', user)
            localStorage.setItem('user', JSON.stringify(user))
            resolve(user)
          } else if (username === 'muser3' && password === 'mpassword3') {
            reject({ message: 'Ce compte a été bloqué.' })
          } else {
            reject({ message: 'Informations de connexion invalides' })
          }
        }, 500) // Simulate network delay
      })
    },
    
    logout({ commit }) {
      localStorage.removeItem('user')
      commit('logout')
    },
    
    checkAuth({ commit }) {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          const user = JSON.parse(userStr) as User
          commit('setUser', user)
        } catch (error) {
          localStorage.removeItem('user')
        }
      }
    }
  }
}

export default authModule