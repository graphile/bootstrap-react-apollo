<template>
  <!-- example snippet adapted from: https://gist.github.com/SirPoot-/82d22463549ae02c7cbd27e8832b59a7 -->
  <!-- ApolloMutation handling inspired by: https://github.com/Akryum/vue-apollo/blob/master/tests/demo/src/components/UserLogin.vue -->
  <v-layout align-center justify-center>
    <v-flex xs12 sm8 md6>
      <div class="text-xs-center">
        <logo />
      </div>
      <ApolloMutation
        :mutation="FORGOT_PASSWORD"
        :variables="{
          email: form.email,
        }
        "
        @done="onDone"
      >
        <template v-slot="{ mutate, loading, gqlError: error }">
          <v-form ref="form" v-model="valid" @submit.prevent="submit(mutate)">
            <v-card class="elevation-3">
              <v-toolbar dark color="primary">
                <v-toolbar-title>Forgot Password</v-toolbar-title>
                <v-spacer />
              </v-toolbar>
              <v-card-text>
                <p>
                  Type in your email address, and we'll send you a link to reset your
                  password.
                </p>
                <v-text-field
                  v-model="form.email"
                  label="E-Mail"
                  :rules="emailRules"
                  required
                />
                <v-layout justify-space-between />
                <div v-if="error" class="error">
                  {{ error.message }}
                </div>
                <div v-if="submitError" class="error">
                  {{ submitError }}
                </div>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn
                  :class="{ 'blue darken-4 white--text': valid}"
                  :disabled="!valid"
                  :loading="loading"
                  type="submit"
                >
                  Send password reset link
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
import FORGOT_PASSWORD from "~/graphql/userForgotPassword.gql";
import Logo from "~/components/Logo.vue";

export default {
  components: {
    Logo,
  },

  data: () => ({
    FORGOT_PASSWORD,
    valid: false,
    form: {
      email: "",
    },
    submitError: null,
    emailRules: [
      v => !!v || "E-mail is required",
      v => /^\w+([.-^+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v)
        || "E-mail must be valid",
    ],
  }),

  computed: {},
  methods: {

    async onDone(
      {
        data: {
          forgotPassword,
        },
      },
    ) {
      if (forgotPassword && forgotPassword.success) {
        // after login go back to Welcome
        this.$router.push({ path: "/" });
      } else {
        this.submitError = "Failed to request password reset";
        this.clear();
      }
    },
    submit(mutate) {
      if (this.$refs.form.validate()) {
        this.submitError = null;
        mutate();
      }
    },
    clear() {
      this.$refs.form.reset();
    },
  },
};
</script>
