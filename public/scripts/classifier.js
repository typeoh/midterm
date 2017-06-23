const ENV         = process.env.ENV || "development";
const knexConfig  = require("../../knexfile");
const knex        = require("knex")(knexConfig[ENV]);
const bayes=require("bayes");
let bayesModel=bayes();
exports.bayesModel=bayesModel;