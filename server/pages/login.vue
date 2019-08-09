<template>
  <!-- example snippet adapted from: https://gist.github.com/SirPoot-/82d22463549ae02c7cbd27e8832b59a7 -->
  <!-- ApolloMutation handling inspired by: https://github.com/Akryum/vue-apollo/blob/master/tests/demo/src/components/UserLogin.vue -->
  <v-layout align-center justify-center>
    <v-flex xs12 sm8 md6>
      <div class="text-xs-center">
        <logo />
      </div>
      <ApolloMutation
        :mutation="LOGIN"
        :variables="{
          username: form.username,
          password: form.password,
        }
        "
        @done="onDone"
      >
        <template v-slot="{ mutate, loading, gqlError: error }">
          <v-form ref="form" v-model="valid" @submit.prevent="submit(mutate)">
            <v-card class="elevation-3">
              <v-toolbar dark color="primary">
                <v-toolbar-title>Login form</v-toolbar-title>
                <v-spacer />
              </v-toolbar>
              <v-card-text>
                <v-text-field
                  v-model="form.username"
                  label="Username / E-Mail:"
                  :rules="usernameRules"
                  required
                />
                <v-text-field
                  v-model="form.password"
                  label="Enter your password"
                  min="8"
                  :append-icon="password_hidden ? 'visibility' : 'visibility_off'"
                  :append-icon-cb="() => (password_hidden = !password_hidden)"
                  :type="password_hidden ? 'password' : 'text'"
                  :rules="passwordRules"
                  counter
                  required
                />
                <v-layout justify-space-between />
                <div v-if="error" class="error">
                  {{ error.message }}
                </div>
              </v-card-text>
              <v-card-actions>
                <nuxt-link :to="'register'">
                  Register
                </nuxt-link>
                <v-spacer />
                <v-btn
                  :class="{ 'black lighten-4 white--text': !valid}"
                  @click="clear"
                >
                  Reset
                </v-btn>
                <v-btn
                  :class="{ 'green lighten-3 black--text': !valid}"
                  href="auth/github/"
                >
                  Login with GitHub
                </v-btn>
                <v-btn
                  :class="{ 'blue darken-4 white--text': valid}"
                  :disabled="!valid"
                  :loading="loading"
                  type="submit"
                >
                  Login
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-form>
        </template>
      </apollomutation>
    </v-flex>
  </v-layout>
</template>

<script>
import CURRENT_USER from "~/graphql/userCurrent.gql";
import LOGIN from "~/graphql/userLogin.gql";
import Logo from "~/components/Logo.vue";

export default {
  apollo: {
    // Simple query that will give us information about the graphql api status
    currentUser: CURRENT_USER,
  },
  components: {
    Logo,
  },

  data: () => ({
    LOGIN,
    valid: false,
    password_hidden: true,
    form: {
      username: "",
      password: "",
    },
    passwordRules: [v => !!v || "Password is required"],
    usernameRules: [v => !!v || "Is required"],
  }),

  computed: {},
  methods: {

    async onDone(
      {
        data: {
          login: { user },
        },
      },
    ) {
      if (!user) return;

      const apolloClient = this.$apollo.provider.defaultClient;
      // Update cache
      apolloClient.writeQuery({
        query: CURRENT_USER,
        data: {
          currentUser: user,
        },
      });

      // after login go back to Welcome
      this.$router.push({ path: "/" });
    },
    submit(mutate) {
      if (this.$refs.form.validate()) {
        mutate();
      }
    },
    clear() {
      this.$refs.form.reset();
    },
  },
};
</script>
