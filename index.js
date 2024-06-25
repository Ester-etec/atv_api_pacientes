const express = require('express');
const mongoose = require('mongoose');
const Paciente = require('./models/paciente');
const crypto = require('crypto');
const { rejects } = require('assert');

//criar app

const app = express();

//configurar para ler json

app.use(express.urlencoded({
    extended: true,
}));
app.use(express.json());

//função criptografar o cpf

const cipher = {
    algorithm: 'aes256',
    secret: 'chave',
    type: 'hex'
};

async function getCrypto(cpf, name) {
    return new Promise((resolve, reject) => {
        const cipherStream = crypto.createCipher(cipher.algorithm, cipher.secret);
        let encryptedData = '';

        cipherStream.on('readable', () => {
            let chunk;
            while (null !== (chunk = cipherStream.read())) {
                encryptedData += chunk.toString(cipher.type);
            }
        });

        cipherStream.on('end', () => {
            resolve(encryptedData);
        });

        cipherStream.on('error', (error) => {
            reject(error);
        });

        cipherStream.write(cpf, name);
        cipherStream.end();
    });
}

//Rotas

app.post('/paciente', async (req, res) => {
    let { name, cpf, idade, cidDoenca } = req.body;
    try {
        let encryptedCpf = await getCrypto(cpf);
        let encryptedName = await getCrypto(name);

        const paciente = {
            name: encryptedName,
            cpf: encryptedCpf,
            idade,
            cidDoenca,
        };

        try {
            await Paciente.create(paciente);
            res.status(201).json({ message: 'Pessoa inserida no sistema com sucesso!' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// O R do CRUD

app.get('/paciente', async (req, res) => {
    try {
        const people = await Paciente.find()

        res.status(200).json(people)
    } catch (error) {
        res.status(500).json({ erro: error })
    }
})


//O 

app.get('/paciente/:id', async (req, res) => {
    const id = req.params.id

    try {
        const paciente = await Paciente.findOne({ _id: id})

        if (! paciente) {
            res.status(422).json({ message: 'Usuário não encontrado!'})
            return
        }
        res.status(200).json(paciente)
    }catch (error) {
        res.status(500).json({ erro: error })
    }
})

//O U do CRUD

app.patch('/paciente/:id', async (req, res) => {
    const id = req.params.id

    const { name, cpf, idade, cidDoenca } = req.body

    const paciente = {
        name,
        cpf,
        idade,
        cidDoenca,
    }

    try {
        const updatePaciente = await Paciente.updateOne({ _id: id}, paciente)

        if (updatePaciente.matchedCount === 0){
            res.status(422).json({ message: 'Usuário não encontrado!'})
            return
        }
        res.status(200).json(paciente)
    }catch (error) {
        res.status(500).json({ erro: error })
    }
});

//O D do CRUD
app.delete('/paciente/:id', async (req, res) => {
    const id = req.params.id

    const paciente = await Paciente.findOne({ _id: id})

    if (!paciente) {
        res.status(422).json({ message: 'Usuário não encontrado!'})
        return
    }

    try {
        const paciente = await Paciente.deleteOne({ _id: id})
    
    res.status(200).json(paciente)
    }catch (error) {
        res.status(500).json({ erro: error })
    }
});


//conexão com banco
let url = "mongodb://localhost:27017/"
mongoose.connect(url).then(()=>{

    console.log("Já tem banco, pode sentar")
    //Hello world
app.get('/', (req, res)=>{
    res.json({message: "Olá, mundo!"});

})
}).catch((err)=>{

    console.log("Não tem banco, fica em pé")
})



app.listen(3000)