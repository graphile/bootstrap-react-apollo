<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <v-card>
        <v-card-title class="headline">
          No Token!
        </v-card-title>
        <v-card-text>
          <div class="error">
            No reset password token passed!
          </div>
        </v-card-text>
        <v-card-actions>
          <v-text-field v-model="token" placeholder="Enter token manually" />
          <NuxtLink :to="`/reset-password/${$route.params.userId}/${token}`">
            <v-btn>Verify</v-btn>
          </NuxtLink>
        </v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  data: () => ({
    token: "",
  }),
};
</script>
