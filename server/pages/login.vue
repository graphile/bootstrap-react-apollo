// example snippet adapted from: https://gist.github.com/SirPoot-/82d22463549ae02c7cbd27e8832b59a7
<template>
 <v-layout align-center justify-center>
    <v-flex xs12 sm8 md6 >
      <div class="text-xs-center">
        <logo />
      </div>
      <v-card class="elevation-3">
        <v-toolbar dark color="primary">
          <v-toolbar-title>Login form</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-card-text>
<v-form v-model="valid" ref="form">
                        <v-text-field
                          label="Enter your e-mail address"
                          v-model="form.email"
                          :rules="emailRules"
                          required
                        ></v-text-field>
                        <v-text-field
                          label="Enter your password"
                          v-model="form.password"
                          min="8"
                          :append-icon="password_hidden ? 'visibility' : 'visibility_off'"
                          :append-icon-cb="() => (password_hidden = !password_hidden)"
                          :type="password_hidden ? 'password' : 'text'"
                          :rules="passwordRules"
                          counter
                          required
                        ></v-text-field>
                        <v-layout justify-space-between>
                        </v-layout>
                      </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="submit" :class=" { 'blue darken-4 white--text' : valid, disabled: !valid }">Login</v-btn>
          <v-spacer></v-spacer>
          <a href="">Register</a>
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
    currentUser: gql`
      query {
        currentUser {
          nodeId
        }
      }`,
  },

  data:() => ({
    valid: false,
    password_hidden: true,
    form: {
      email: '',
      password: '',
    },
    passwordRules: [
      (v) => !!v || 'Password is required',
    ],
    emailRules: [
      (v) => !!v || 'E-mail is required',
      (v) => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'E-mail must be valid'
    ],
  }),
  components: {
    Logo,
    VuetifyLogo
  },

  computed: {
  }
  ,
  methods: {
     submit () {
            if (this.$refs.form.validate()) {
              this.$refs.form.$el.submit()
            }
          },
          clear () {
            this.$refs.form.reset()
          }
  }
}
</script>
