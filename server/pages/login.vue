<template>
  <!-- example snippet adapted from: https://gist.github.com/SirPoot-/82d22463549ae02c7cbd27e8832b59a7 -->
  <!-- ApolloMutation handling inspired by: https://github.com/Akryum/vue-apollo/blob/master/tests/demo/src/components/UserLogin.vue -->
  <v-layout align-center justify-center>
    <v-flex xs12 sm8 md6>
      <div class="text-xs-center">
        <logo />
      </div>
      <v-card class="elevation-3">
        <v-toolbar dark color="primary">
          <v-toolbar-title>Login form</v-toolbar-title>
          <v-spacer />
        </v-toolbar>
        <v-card-text>
          <v-form ref="form" v-model="valid">
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
              :append-icon-cb="() => (password_hidden = !password_hidden)"
              :type="password_hidden ? 'password' : 'text'"
              :rules="passwordRules"
              counter
              required
            />
            <v-layout justify-space-between />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn
            :class="{ 'blue darken-4 white--text': valid, disabled: !valid }"
            @click="submit"
          >
            Login
          </v-btn>
          <v-spacer />
          <router-link :to="'register'">
            Register
          </router-link>
        </v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
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
    valid: false,
    password_hidden: true,
    form: {
      email: "",
      password: "",
    },
    passwordRules: [v => !!v || "Password is required"],
    emailRules: [
      v => !!v || "E-mail is required",
      v => /^\w+([.-^+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v)
        || "E-mail must be valid",
    ],
  }),

  computed: {},
  methods: {
    submit() {
      if (this.$refs.form.validate()) {
        this.$refs.form.$el.submit();
      }
    },
    clear() {
      this.$refs.form.reset();
    },
  },
};
</script>
