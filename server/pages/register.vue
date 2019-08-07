<template>
  <!-- example snippet adapted from: https://gist.github.com/SirPoot-/82d22463549ae02c7cbd27e8832b59a7 -->
  <!-- ApolloMutation handling inspired by: https://github.com/Akryum/vue-apollo/blob/master/tests/demo/src/components/UserLogin.vue -->
  <v-layout align-center justify-center>
    <v-flex xs12 sm8 md6>
      <div class="text-xs-center">
        <logo />
      </div>
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
          <v-form ref="form" v-model="valid" @submit.prevent="submit(mutate)">
            <v-card class="elevation-3">
              <v-toolbar dark color="primary">
                <v-toolbar-title>Register</v-toolbar-title>
                <v-spacer />
              </v-toolbar>
              <v-card-text>
                <v-text-field
                  v-model="form.email"
                  label="Enter your e-mail address"
                  :rules="emailRules"
                  required
                />
                <v-text-field
                  v-model="form.password"
                  label="Enter your password"
                  min="8"
                  :append-icon="password_hidden ? 'visibility' : 'visibility_off'"
                  :type="password_hidden ? 'password' : 'text'"
                  :rules="passwordRules"
                  counter
                  required
                  @click:append="() => (password_hidden = !password_hidden)"
                />
                <v-text-field
                  v-model="form.username"
                  label="Enter your username (optional, but recommended)"
                  :rules="usernameRules"
                />
                <v-text-field
                  v-model="form.name"
                  label="Enter your full name (optional)"
                />
                <v-text-field
                  v-model="form.avatarUrl"
                  label="Enter your avatar url (optional)"
                  :rules="avatarUrlRules"
                />
                <v-layout justify-space-between />
                <div v-if="error" class="error">
                  {{ error.message }}
                </div>
              </v-card-text>
              <v-card-actions>
                <v-btn
                  type="reset"
                  @click="clear"
                >
                  Reset
                </v-btn>
                <v-spacer />
                <v-btn
                  :class="{ 'blue darken-4 white--text': valid}"
                  :disabled="!valid"
                  :loading="loading"
                  type="submit"
                >
                  Register
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-form>
        </template>
      </ApolloMutation>
    </v-flex>
  </v-layout>
</template>

<script>
import REGISTER from "../graphql/userRegister.gql";
import CURRENT_USER from "../graphql/userCurrent.gql";
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
    REGISTER,
    valid: false,
    password_hidden: true,
    form: {
      username: "",
      email: "",
      password: "",
      name: "",
      avatarUrl: "",
    },
    emailRules: [
      v => !!v || "E-mail is required",
      v => /^\w+([.-^+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v)
        || "E-mail must be valid",
    ],
    passwordRules: [v => !!v || "Password is required"],
    usernameRules: [
      v => (v.length === 0 || v.length >= 2) || "Username must be longer than 2 characters",
      v => (v.length === 0 || v.length <= 24) || "Username must be shorter than 24 characters",
      v => (v.length === 0 || /^[a-zA-Z]([a-zA-Z0-9][_]?)+$/.test(v)) || "Username must be valid",
    ],
    avatarUrlRules: [
      v => (v.length === 0 || /(https?):\/\/([0-9A-Za-z\\.\-?@:%_+~#=/]+)+/.test(v)) || "AvatarUrl must start with http[s]://",
    ],

  }),

  computed: {},
  methods: {
    async onDone(
      {
        data: {
          register: { user },
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

      // after register and login go back to Welcome
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
