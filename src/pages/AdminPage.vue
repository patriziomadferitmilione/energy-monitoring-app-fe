<template>
  <q-page class="q-pa-md">
    <h4 class="text-center">Gestione Utenti e Provider</h4>

    <div class="q-mb-md">
      <q-btn
        color="primary"
        label="Nuovo Utente"
        @click="adminStore.openUserDialog()"
        class="q-mr-md"
      />
      <q-btn color="secondary" label="Nuovo Provider" @click="adminStore.openProviderDialog()" />
    </div>

    <!-- USER -->
    <h5>Utenti</h5>
    <q-list bordered separator v-if="users.length">
      <q-item v-for="user in users" :key="user._id">
        <q-item-section>
          <q-item-label>{{ user.first_name }} {{ user.last_name }}</q-item-label>
          <q-item-label caption>Email: {{ user.email }}</q-item-label>
          <q-item-label caption>Ruolo: {{ user.role }}</q-item-label>
          <q-item-label caption>Telefono: {{ user.phone || 'N/A' }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn
            icon="edit"
            color="primary"
            @click="adminStore.openEditUserDialog(user)"
            class="q-mr-md"
          />
          <q-btn icon="delete" color="negative" @click="adminStore.deleteUser(user._id)" />
        </q-item-section>
      </q-item>
    </q-list>
    <q-banner v-else class="bg-warning text-dark"> Nessun utente disponibile. </q-banner>

    <!-- Add User Dialog -->
    <q-dialog v-model="adminStore.showUserDialog">
      <q-card style="width: 450px">
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
            class="q-mb-md"
          />
          <q-input v-model="adminStore.newUser.first_name" label="Nome" class="q-mb-md" />
          <q-input v-model="adminStore.newUser.last_name" label="Cognome" class="q-mb-md" />
          <q-input v-model="adminStore.newUser.email" label="Email" class="q-mb-md" />
          <q-input v-model="adminStore.newUser.phone" label="Telefono" class="q-mb-md" />
          <q-input
            v-model="adminStore.newUser.password"
            label="Password"
            type="password"
            class="q-mb-md"
            v-if="!adminStore.isEditingUser"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Annulla" color="negative" @click="adminStore.closeUserDialog()" />
          <q-btn
            label="Salva"
            color="primary"
            @click="
              adminStore.newUser.first_name &&
              adminStore.newUser.last_name &&
              adminStore.newUser.email &&
              adminStore.newUser.role &&
              (!adminStore.isEditingUser ? adminStore.newUser.password : true)
                ? adminStore.isEditingUser
                  ? adminStore.updateUser()
                  : adminStore.addUser()
                : $q.notify({ type: 'negative', message: 'Compila tutti i campi obbligatori' })
            "
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- PROVIDERS -->
    <h5 class="q-mt-md">Providers</h5>
    <q-list bordered separator v-if="providers.length">
      <q-item v-for="provider in providers" :key="provider._id">
        <q-item-section>
          <q-item-label>{{ provider.name }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn
            icon="edit"
            color="primary"
            @click="adminStore.openEditProviderDialog(provider)"
            class="q-mr-md"
          />
          <q-btn icon="delete" color="negative" @click="adminStore.deleteProvider(provider._id)" />
        </q-item-section>
      </q-item>
    </q-list>
    <q-banner v-else class="bg-warning text-dark"> Nessun provider disponibile. </q-banner>

    <!-- Add Provider Dialog -->
    <q-dialog v-model="adminStore.showProviderDialog">
      <q-card style="width: 450px">
        <q-card-section>
          <div class="text-h6">
            {{ adminStore.isEditingProvider ? 'Modifica Provider' : 'Aggiungi Nuovo Provider' }}
          </div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="adminStore.newProvider.name" label="Nome Provider" class="q-mb-md" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Annulla" color="negative" @click="adminStore.closeProviderDialog()" />
          <q-btn
            label="Salva"
            color="primary"
            @click="
              adminStore.isEditingProvider ? adminStore.updateProvider() : adminStore.addProvider()
            "
          />
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
  created() {
    this.adminStore.fetchUsers()
    this.adminStore.fetchProviders()
  },
}
</script>
