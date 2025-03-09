<template>
  <q-layout view="lHh lpR fFf">
    <q-page-container>
      <q-page class="flex flex-center">
        <q-card class="q-pa-md shadow-2" style="width: 300px">
          <q-card-section>
            <div class="text-h6">{{ isSignup ? 'Iscrizione' : 'Login' }}</div>
          </q-card-section>

          <q-form @submit.prevent="isSignup ? register() : login()">
            <q-card-section>
              <q-input v-model="email" label="Email" type="email" required autocomplete="email" />

              <q-input
                v-model="password"
                label="Password"
                type="password"
                class="q-mt-md"
                required
                autocomplete="current-password"
              />

              <q-input
                v-if="isSignup"
                v-model="first_name"
                label="First Name"
                type="text"
                class="q-mt-md"
                required
              />
              <q-input
                v-if="isSignup"
                v-model="last_name"
                label="Last Name"
                type="text"
                class="q-mt-md"
                required
              />
              <q-input
                v-if="isSignup"
                v-model="phone"
                label="Phone (Optional)"
                type="text"
                class="q-mt-md"
              />
            </q-card-section>

            <q-card-actions align="right">
              <q-btn type="submit" :label="isSignup ? 'Iscriviti' : 'Login'" color="primary" />
            </q-card-actions>
          </q-form>

          <q-card-section class="text-center">
            <q-btn
              flat
              @click="toggleMode"
              :label="isSignup ? 'Login' : 'Iscrizione'"
              color="primary"
            />
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { useAuthStore } from 'stores/authStore'

export default {
  data() {
    return {
      authStore: useAuthStore(),
      isSignup: false,
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      phone: '',
    }
  },
  methods: {
    async login() {
      try {
        await this.authStore.login({ email: this.email, password: this.password })
        this.$router.push('/')
      } catch (error) {
        console.error('[LoginPage] Login error:', error)
        alert(error.response?.data?.message || 'Invalid credentials or server error.')
      }
    },
    async register() {
      try {
        await this.authStore.register({
          role: 'user',
          email: this.email,
          password: this.password,
          first_name: this.first_name,
          last_name: this.last_name,
          phone: this.phone,
        })
      } catch (error) {
        console.error('[LoginPage] Registration error:', error)
      }
    },
    toggleMode() {
      this.isSignup = !this.isSignup
    },
  },
}
</script>

<style scoped lang="scss">
.q-field {
  &.q-field--highlighted {
    .q-field__control {
      border-color: #6200ea; // Custom purple on focus
      box-shadow: 0 0 5px rgba(98, 0, 234, 0.5);
    }
  }

  &:hover .q-field__control {
    border-color: #03a9f4; // Custom blue on hover
  }
}

.q-field--focused {
  .q-field__control {
    border: 2px solid #ff9800 !important; // Orange border on focus
  }
}

.q-field--error {
  .q-field__control {
    border: 2px solid #f44336 !important; // Red border on error
  }
}

.q-field.q-field--highlighted {
  .q-field__control {
    background: rgba(98, 0, 234, 0.1); // Light purple when focused
  }
}

.q-field {
  .q-field__native {
    color: #4caf50; // Green text
  }

  &.q-field--focused {
    .q-field__native {
      color: #ff5722; // Deep orange when focused
    }
  }
}
</style>
