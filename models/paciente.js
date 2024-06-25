const mongoose = require("mongoose");

const Paciente = mongoose.model("Paciente", {

    name: String,
    cpf: String,
    idade: Number,
    cidDoenca: String
});

module.exports = Paciente;