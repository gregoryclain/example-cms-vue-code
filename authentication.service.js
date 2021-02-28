/* eslint-disable handle-callback-err */
/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
/* eslint-disable space-before-function-paren */
/* eslint-disable semi */
import axios from "axios";
// import { mapState } from "vuex";
import { getToken, getRoles, getPermission, hasRole, decodeToken } from "@brickblock/authorisation-library";
import { getHeader } from "@/config";
// ne peut
import store from "../../src/store";
import router from "../../src/router";

import VueJwtDecode from "vue-jwt-decode";

const URL_API = process.env.VUE_APP_URL_DISTANT_API;
const URL_USER = URL_API + "api/user"; // protected route
const URL_LOGIN = URL_API + "api/auth/login"; // get token user

var authUser = {};

function logout() {
  store.dispatch("clearAuthUser");
  window.localStorage.removeItem("authUser");
  router.push("/");
}

function login(credentials) {
  let payLoadLogin = credentials;
  axios
    .post(URL_LOGIN, payLoadLogin)
    .then(response => {
      authUser = response.data;
      window.localStorage.setItem("authUser", JSON.stringify(authUser));

      axios
        .get(URL_USER, { headers: getHeader() })
        .then(response => {
          if (response.data.user.actif) {
            store.dispatch("setUserRole", response.data.user.roles);
            store.dispatch("setUserObject", authUser); // OK
            router.push({ name: "admin-default" }); // OK
          } else {
            logout();
          }
        })
        .catch(error => {
          console.log("error");
        });
    })
    .catch(error => {
      console.log("error = ", error);
    });
}

function checkRoles() {
  if (window.localStorage.getItem("authUser")) {
    let userObj = JSON.parse(window.localStorage.getItem("authUser"));
    // console.log("userObj", userObj);
    axios
      .get(URL_USER, { headers: getHeader() })
      .then(response => {
        store.dispatch("setUserRole", response.data.user.roles);
      })
      .catch(error => {
        console.log("error");
        logout();
      });
  }
}

export const authenticationService = {
  logout,
  login,
  checkRoles
};
