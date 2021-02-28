//...
// Pour des raisons de confidentialités, seul une partie du code est visible

/* eslint-disable no-unused-vars */
/* eslint-disable semi */
/* eslint-disable quotes */
/* eslint-disable space-before-function-paren */
// fichier a importer aux component
export const getHeaderClient = function() {
  const tokenData = JSON.parse(window.localStorage.getItem("authUserClient"));
  const headers = {
    Accept: "application/json",
    Authorization: "Bearer" + tokenData.client_token
  };
  return headers;
};
