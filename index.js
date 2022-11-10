import express, { json } from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv"
import Joi from "joi";
//import pkg from "joi"
//const { valid } = pkg;


const app = express();

dotenv.config();
app.use(cors());
app.use(express.json());

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;

try {
    await mongoClient.connect();
    db = mongoClient.db("Batepapo_UOL");
    const participants = db.collection("participants");
    const messages = db.collection("messages");
} catch (err) {
    console.log(err);
}


app.post("/participants", async (req, res) => {

    try {

        const { name } = req.body;
        console.log(name);

        const schema = Joi.object({
            name: Joi.string().required()
        })

        const validation = await schema.validateAsync(req.body);
        console.log(validation);
        res.send("deu bom")
    } catch (error) {

        if (error.isJoi === true) {
            res.status(422).send("name deve ser strings não vazio");
        }
        console.log("deu ruim");
    }

});


app.listen(5000, () => console.log("Server running in port 5000"));