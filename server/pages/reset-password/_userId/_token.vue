<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <ApolloMutation
        :mutation="RESET_PASSWORD"
        :variables="{
          userId: parseInt($route.params.userId),
          newPassword: form.password,
          token: $route.params.token,
        }
        "
        @done="onDone"
      >
        <template v-slot="{ mutate, loading, gqlError: error }">
          <v-form ref="form" v-model="valid" @submit.prevent="submit(mutate)">
            <v-card>
              <v-card-title class="headline">
                Reset Password!
              </v-card-title>
              <v-card-text>
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
                  v-model="form.repeatPassword"
                  label="Enter your repeatPassword"
                  min="8"
                  :append-icon="repeatPassword_hidden ? 'visibility' : 'visibility_off'"
                  :type="repeatPassword_hidden ? 'password' : 'text'"
                  :rules="repeatPasswordRules"
                  counter
                  required
                  @click:append="() => (repeatPassword_hidden = !repeatPassword_hidden)"
                />
                <div v-if="error && !loading" class="error">
                  {{ error.message || error }}
                </div>
              </v-card-text>
              <v-card-actions>
                <nuxt-link :to="'register'">
                  Don't have an account? Create one
                </nuxt-link>
                <v-spacer />
                <v-btn
                  :class="{ 'blue darken-4 white--text': valid}"
                  :disabled="!valid"
                  :loading="loading"
                  type="submit"
                >
                  Set Password
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
import RESET_PASSWORD from "~/graphql/userResetPassword.gql";
import CURRENT_USER from "~/graphql/userCurrent.gql";

export default {
  data: vm => ({
    RESET_PASSWORD,
    valid: false,
    password_hidden: true,
    repeatPassword_hidden: true,
    form: {
      password: "",
      repeatPassword: "",
    },
    loading: false,
    error: null,
    passwordRules: [v => !!v || "Password is required"],
    repeatPasswordRules: [v => !!v || "Password is required",
      function () { return this.passwordsMatch || "Passwords must match" }.bind(vm)],
  }),
  computed: {
    passwordsMatch() {
      return this.form.password === this.form.repeatPassword;
    },
  },

  methods: {
    async onDone(
      {
        data: {
          resetPassword: { user },
        },
      },
    ) {
      if (!user) return;

      // after successful reset go back to login
      this.$router.push({ path: "/login" });
    },
    submit(mutate) {
      if (this.$refs.form.validate()) {
        mutate();
      }
    },
  },
};
</script>
