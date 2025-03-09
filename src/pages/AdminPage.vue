<template>
  <q-page class="q-pa-md page">
    <div class="row justify-between items-center">
      <h4 class="text-primary">Pannello Admin</h4>
      <div>
        <q-btn
          color="primary"
          label="Nuovo Utente"
          icon="person_add"
          text-color="secondary"
          @click="adminStore.openUserDialog()"
          class="q-mr-md"
        />
        <q-btn
          color="secondary"
          label="Nuovo Fornitore"
          icon="business"
          text-color="primary"
          @click="adminStore.openProviderDialog()"
        />
      </div>
    </div>

    <q-separator class="q-my-md" />

    <div class="row q-col-gutter-md items-baseline justify-center">
      <!-- USERS LIST -->
      <div class="col-12 col-md-6">
        <q-card flat bordered class="q-mb-md card">
          <q-card-section class="bg-primary text-secondary">
            <div class="text-h6">Utenti</div>
          </q-card-section>

          <q-card-section class="user-list">
            <div v-if="users.length" class="row q-col-gutter-md">
              <div v-for="user in users" :key="user._id" class="col-12 col-sm-6 col-md-6">
                <q-card class="user-card">
                  <q-card-section>
                    <div class="text-h6">{{ user.first_name }} {{ user.last_name }}</div>
                    <div class="text-caption">{{ user.role.toUpperCase() }}</div>
                  </q-card-section>

                  <q-card-section>
                    <div class="text-body2"><q-icon name="email" /> {{ user.email }}</div>
                    <div class="text-body2"><q-icon name="phone" /> {{ user.phone || 'N/A' }}</div>
                  </q-card-section>

                  <q-separator />

                  <q-card-actions align="right">
                    <q-btn
                      flat
                      icon="edit"
                      color="info"
                      @click="adminStore.openEditUserDialog(user)"
                    />
                    <q-btn
                      flat
                      icon="delete"
                      color="negative"
                      @click="confirmDeleteUser(user._id)"
                    />
                  </q-card-actions>
                </q-card>
              </div>
            </div>

            <q-banner v-else class="bg-warning text-dark"> Nessun utente disponibile. </q-banner>
          </q-card-section>
        </q-card>
      </div>

      <!-- PROVIDERS LIST -->
      <div class="col-12 col-md-6">
        <q-card flat bordered class="card">
          <q-card-section class="bg-secondary text-primary">
            <div class="text-h6">Fornitori</div>
          </q-card-section>

          <q-card-section class="provider-list">
            <div v-if="providers.length" class="row q-col-gutter-md">
              <div
                v-for="provider in providers"
                :key="provider._id"
                class="col-12 col-sm-6 col-md-6"
              >
                <q-card class="provider-card">
                  <q-card-section>
                    <div class="text-h6">{{ provider.name }}</div>
                  </q-card-section>

                  <q-separator />

                  <q-card-actions align="right">
                    <q-btn
                      flat
                      icon="edit"
                      color="info"
                      @click="adminStore.openEditProviderDialog(provider)"
                    />
                    <q-btn
                      flat
                      icon="delete"
                      color="negative"
                      @click="confirmDeleteProvider(provider._id)"
                    />
                  </q-card-actions>
                </q-card>
              </div>
            </div>

            <q-banner v-else class="bg-warning text-dark"> Nessun provider disponibile. </q-banner>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- ADD / EDIT USER DIALOG -->
    <q-dialog v-model="adminStore.showUserDialog">
      <q-card style="max-width: 500px">
        <q-card-section>
          <div class="text-h6">
            {{ adminStore.isEditingUser ? 'Modifica Utente' : 'Aggiungi Nuovo Utente' }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-select
            v-model="adminStore.newUser.role"
            label="Ruolo"
            :options="['admin', 'user']"
            dense
            outlined
            class="q-mb-md"
          />
          <q-input
            v-model="adminStore.newUser.first_name"
            label="Nome"
            dense
            outlined
            class="q-mb-md"
          />
          <q-input
            v-model="adminStore.newUser.last_name"
            label="Cognome"
            dense
            outlined
            class="q-mb-md"
          />
          <q-input
            v-model="adminStore.newUser.email"
            label="Email"
            dense
            outlined
            class="q-mb-md"
          />
          <q-input
            v-model="adminStore.newUser.phone"
            label="Telefono"
            dense
            outlined
            class="q-mb-md"
          />
          <q-input
            v-model="adminStore.newUser.password"
            label="Password"
            type="password"
            dense
            outlined
            class="q-mb-md"
            v-if="!adminStore.isEditingUser"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Annulla" color="negative" @click="adminStore.closeUserDialog()" />
          <q-btn label="Salva" color="primary" @click="saveUser" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ADD / EDIT PROVIDER DIALOG -->
    <q-dialog v-model="adminStore.showProviderDialog">
      <q-card style="max-width: 500px">
        <q-card-section>
          <div class="text-h6">
            {{ adminStore.isEditingProvider ? 'Modifica Provider' : 'Aggiungi Nuovo Provider' }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="adminStore.newProvider.name"
            label="Nome Provider"
            dense
            outlined
            class="q-mb-md"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Annulla" color="negative" @click="adminStore.closeProviderDialog()" />
          <q-btn label="Salva" color="primary" @click="saveProvider" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { useAdminStore } from '../stores/adminStore'

export default {
  name: 'AdminPage',
  data() {
    return {
      adminStore: useAdminStore(),
    }
  },
  computed: {
    users() {
      return this.adminStore.users
    },
    providers() {
      return this.adminStore.providers
    },
  },
  methods: {
    saveUser() {
      if (
        !this.adminStore.newUser.first_name ||
        !this.adminStore.newUser.last_name ||
        !this.adminStore.newUser.email ||
        !this.adminStore.newUser.role ||
        (!this.adminStore.isEditingUser ? !this.adminStore.newUser.password : false)
      ) {
        this.$q.notify({ type: 'negative', message: 'Compila tutti i campi obbligatori' })
        return
      }
      this.adminStore.isEditingUser ? this.adminStore.updateUser() : this.adminStore.addUser()
    },

    saveProvider() {
      if (!this.adminStore.newProvider.name) {
        this.$q.notify({ type: 'negative', message: 'Inserisci il nome del provider' })
        return
      }
      this.adminStore.isEditingProvider
        ? this.adminStore.updateProvider()
        : this.adminStore.addProvider()
    },

    confirmDeleteUser(userId) {
      if (confirm('Sei sicuro di voler eliminare questo utente?')) {
        this.adminStore.deleteUser(userId)
      }
    },

    confirmDeleteProvider(providerId) {
      if (confirm('Sei sicuro di voler eliminare questo provider?')) {
        this.adminStore.deleteProvider(providerId)
      }
    },
  },
  created() {
    this.adminStore.fetchUsers()
    this.adminStore.fetchProviders()
  },
}
</script>

<style scoped lang="scss">
.page {
  background-color: $light;
}

.card {
  min-height: 50vh;
  background-color: $light1;
}

.user-list {
  background-color: $light1;

  .user-card {
    background-color: $light;
  }
}

.provider-list {
  background-color: $light1;

  .provider-card {
    background-color: $light;
  }
}
</style>
