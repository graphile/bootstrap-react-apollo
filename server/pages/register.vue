<template>
  <!-- example snippet adapted from: https://gist.github.com/SirPoot-/82d22463549ae02c7cbd27e8832b59a7 -->
  <v-layout align-center justify-center>
    <v-flex xs12 sm8 md6>
      <div class="text-xs-center">
        <logo />
      </div>
      <v-card class="elevation-3">
        <v-toolbar dark color="primary">
          <v-toolbar-title>Register</v-toolbar-title>
          <v-spacer />
        </v-toolbar>
        <v-card-text>
          <ApolloMutation
            :mutation="REGISTER"
            :variables="{
              username: form.username,
              email: form.email,
              password: form.password,
              name: form.name,
              avatarUrl: form.avatarUrl,
            }
            "
            @done="onDone"
          >
            <template v-slot="{ mutate, loading, gqlError: error }">
              <form
                class="form"
                @submit.prevent="mutate()"
              >
                <input
                  v-model="form.email"
                  class="form-input"
                  type="email"
                  name="email"
                  placeholder="Email"
                  required
                >
                <input
                  v-model="form.password"
                  class="form-input"
                  type="password"
                  name="password"
                  placeholder="Password"
                  required
                >
                <input
                  v-model="form.username"
                  class="form-input"
                  name="username"
                  placeholder="Username"
                  required
                >
                <div v-if="error" class="error">
                  {{ error.message }}
                </div>
                <button
                  type="submit"
                  :disabled="loading"
                  class="button"
                  data-id="submit-new-account"
                >
                  Register
                </button>
              </form>
            </template>
          </ApolloMutation>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import gql from 'graphql-tag'
import REGISTER from '../graphql/userRegister.gql'
import Logo from '~/components/Logo.vue'

export default {
  apollo: {
    // Simple query that will give us information about the graphql api status
    currentUser: gql`
      query currentUser {
        currentUser {
          nodeId
        }
      }
    `,
  },
  components: {
    Logo,
  },

  data: () => ({
    REGISTER,
    valid: false,
    password_hidden: true,
    form: {
      username: '',
      email: '',
      password: '',
      name: '',
      avatarUrl: null,
    },
    passwordRules: [v => !!v || 'Password is required'],
    emailRules: [
      v => !!v || 'E-mail is required',
      v => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v)
        || 'E-mail must be valid',
    ],
  }),

  computed: {},
  methods: {
    async onDone(result) {
      if (!result.data.register.user) return

      const apolloClient = this.$apollo.provider.defaultClient
      // Update cache
      apolloClient.writeQuery({
        query: gql`query currentUser{
            currentUser {
              nodeId
              username
            }
        }`,
        data: {
          currentUser: result.data.register.user,
        },
      })
    },
    submit() {
      if (this.$refs.form.validate()) {
        this.$refs.form.$el.submit()
      }
    },
    clear() {
      this.$refs.form.reset()
    },
  },
}
</script>
