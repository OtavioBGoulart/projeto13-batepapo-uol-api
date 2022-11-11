import express, { json } from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv"
import joi from "joi";
import dayjs from "dayjs"


const userSchema = joi.object({
    name: joi.string().required()
})



const app = express();

dotenv.config();
app.use(cors());
app.use(express.json());

const mongoClient = new MongoClient(process.env.MONGO_URI);


try {
    await mongoClient.connect();
    console.log("MongoDB conectado");

} catch (err) {
    console.log(err);
}

const db = mongoClient.db("Batepapo_UOL");
const userscollections = db.collection("participants");
const messagescolletiosn = db.collection("messages");


app.post("/participants", async (req, res) => {

    const { name } = req.body
    const validation = userSchema.validate(req.body, { abortEarly: false });

    if (validation.error) {

        res.status(422).send(validation.error.message);
        return;
    }

    try {

        const userExists = await userscollections.find({ name: name.toLowerCase() })

        if (userExists) {

            res.status(409).send("Usuario já existente");
            return;
        }

        await userscollections.insertOne({name: name.toLowerCase(), lastStatus: Date.now()});
        await messagescolletiosn.insertOne({from: name, to: 'Todos', text: 'entra na sala...', type: 'status', time: dayjs().format("HH:mm:ss")});
        res.sendStatus(201);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }

});



app.listen(5000, () => console.log("Server running in port 5000"));