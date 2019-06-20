<template>
  <v-layout
    column
    justify-center
    align-center
  >
    <v-flex
      xs12
      sm8
      md6
    >
      <div class="text-xs-center">
        <logo />
        <vuetify-logo />
      </div>
      <v-card>
        <v-card-title class="headline">Welcome to the Postgraphile + Nuxt.js +  Vuetify bootstrap!</v-card-title>
        <v-card-text>
          <p> Edit <code>/server/pages/index.vue</code> and save to hot-reload. </p>
          <div>
            <div>
              <div v-if="computedApolloWorking">
                  <v-btn round="round" dark="dark" color="green lighten-3" :to="'login'" :loading="isLoading">
                      <v-icon>thumb_up</v-icon><span>&nbsp;GraphQl connected</span>
                  </v-btn>
              </div>
              <div v-if="!computedApolloWorking">
                  <v-btn round="round" dark="dark" color="red lighten-3" :to="'index'" :loading="isLoading">
                      <v-icon>thumb_down</v-icon><span>&nbsp;GraphQl not connected</span>
                  </v-btn>
              </div>
              <div v-if="isLoggedIn">
                <span><span className="wave">👋</span> And Logged in</span>;
              </div>
              <div v-if="!isLoggedIn">
                  <v-btn round="round" dark="dark" color="red lighten-3" :to="'login'" :loading="isLoading">
                <v-icon>https</v-icon> Not logged in
              </v-btn>
              </div>
              <br />
              <br />
              <router-link :to="'login'">Login</router-link>
              <br />
            </div>
            <!--
              This is an "a" tag because we want a full page reload,
              GraphiQL is not embedded into our Vue app
            -->
            <a href="/api/graphiql"  target="_blank"> View API in GraphiQL </a>
            <br />
            <br />
            <a
              href="https://github.com/graphile/bootstrap-react-apollo/blob/master/README.md"
              target="_blank"
              rel="noopener noreferrer"
            >
              View README for project structure
            </a>
            <br />
            <a
              href="https://www.graphile.org/postgraphile/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn PostGraphile
            </a>
            <br />
          </div>
        </v-card-text>

        <v-card-title class="headline">Vuetify.js</v-card-title>
        <v-card-text>
          <p>Vuetify is a progressive Material Design component framework for Vue.js. It was designed to empower developers to create amazing applications.</p>
          <p>For more information on Vuetify, check out the <a
            href="https://vuetifyjs.com"
            target="_blank"
          >documentation</a>.</p>
          <p>If you have questions, please join the official <a
            href="https://chat.vuetifyjs.com/"
            target="_blank"
            title="chat"
          >discord</a>.</p>
          <p>Find a bug? Report it on the github <a
            href="https://github.com/vuetifyjs/vuetify/issues"
            target="_blank"
            title="contribute"
          >issue board</a>.</p>
          <p>Thank you for developing with Vuetify and I look forward to bringing more exciting features in the future.</p>
          <div class="text-xs-right">
            <em><small>&mdash; John Leider</small></em>
          </div>
          <hr class="my-3">
          <a
            href="https://nuxtjs.org/"
            target="_blank"
          >Nuxt Documentation</a>
          <br>
          <a
            href="https://github.com/nuxt/nuxt.js"
            target="_blank"
          >Nuxt GitHub</a>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            flat
            nuxt
            to="/inspire"
          >Continue</v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
</template>


<script>
import Logo from '~/components/Logo.vue'
import VuetifyLogo from '~/components/VuetifyLogo.vue'
import gql from "graphql-tag";

export default {
  apollo: {
    // Simple query that will give us information about the graphql api status
    nodeId: gql`
      query {
        nodeId
      }`,
    currentUser: gql`
      query {
        currentUser {
          nodeId
        }
      }`,
  },
  components: {
    Logo,
    VuetifyLogo
  },
  computed: {
    isLoading() {
      if (this.$apollo.loading) return true;
      return false;
    },
    isLoggedIn() {
      if (this.currentUser) return true;
      return false;
    },
    computedApolloWorking() {
      if (this.nodeId === "query") return true;
      return false;
    }
  }
}
</script>
