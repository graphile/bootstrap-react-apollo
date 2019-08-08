<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <v-form @submit.prevent="verifyEmail">
        <v-card>
          <v-card-title class="headline">
            Verify Email!
          </v-card-title>
          <v-card-text>
            <div v-if="userEmail && userEmail.isVerified">
              <div class="success">
                Email: {{ userEmail.email }} is verified
              </div>
              <NuxtLink to="/">
                Continue
              </NuxtLink>
            </div>
            <div v-if="error && !loading" class="error">
              {{ error.message || error }}
            </div>
          </v-card-text>
          <v-card-actions v-if="!userEmail">
            <v-btn
              class="green darken-4 white--text"
              :loading="loading"
              type="submit"
            >
              Verify: {{ $route.params.id }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-flex>
  </v-layout>
</template>

<script>
import VERIFY_USER_EMAIL from "~/graphql/userVerifyEmail.gql";

async function _verifyEmail({ $apolloClient, token }) {
  try {
    const {
      data: {
        verifyUserEmail: { userEmail },
      },
    } = await $apolloClient.mutate({
    // Query
      mutation: VERIFY_USER_EMAIL,
      // Parameters
      variables: {
        token,
      },
    });
    return { userEmail, loading: false, error: null };
  } catch (error) {
    return { error: error.message.message ? error.message : error };
  }
}
export default {
  data: () => ({
    VERIFY_USER_EMAIL,
    loading: false,
    error: null,
    userEmail: null,
  }),

  // verifies on server side while loading page
  async asyncData({ params, app }) {
    const $apolloClient = app.apolloProvider.clients.serverSide;
    return _verifyEmail({ $apolloClient, token: params.id });
  },
  methods: {
    // verifies on submit
    async verifyEmail() {
      this.loading = true;
      this.error = "";
      // destructering results to only use our reactive data
      const results = (({ userEmail, loading, error }) => ({ userEmail, loading, error }))(await _verifyEmail({
        $apolloClient: this.$apollo,
        token: this.$route.params.id,
      }));

      // copy results into this.data at once
      Object.assign(this, results);
    },
  },
};
</script>
