import express, { json } from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv"
import joi from "joi";
import dayjs from "dayjs"


const userSchema = joi.object({
    name: joi.string().required()
})


const messageSchema = joi.object({
    to: joi.string().required(),
    text: joi.string().required(),
    type: joi.valid("message", "private_message")
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

        const userExists = await userscollections.find({ name: name.toLowerCase() }).toArray();
        //console.log(userExists);

        if (userExists.length !== 0) {

            res.status(409).send("Usuario já existente");
            return;
        }

        await userscollections.insertOne({ name: name.toLowerCase(), lastStatus: Date.now() });
        await messagescolletiosn.insertOne({ from: name.toLowerCase(), to: 'Todos', text: 'entra na sala...', type: 'status', time: dayjs().format("HH:mm:ss") });
        res.sendStatus(201);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }

});

app.get("/participants", async (req, res) => {

    try {
        const participants = await userscollections.find().toArray();
        res.send(participants);
    } catch {
        res.sendStatus(500);
    }

})

app.post("/messages", async(req, res) => {

    const { to, text, type } = req.body;
    const user = req.headers.user
    console.log(user);

    const validation = messageSchema.validate(req.body, { abortEarly: false });

    if (validation.error) {
        const error = validation.error.details.map((details) => details.message);
        console.log(error);
        res.status(422).send(error);
        return;
    }

    try {

        const userExists = await userscollections.find({ name: to.toLowerCase() }).toArray();

        if (userExists.length == 0) {
            res.status(422).send("Esse participante não existe")
            return;
        }

        await messagescolletiosn.insertOne({ from: user.toLowerCase(), to: to.toLowerCase(), text: text, type: type, time: dayjs().format("HH:mm:ss") });
        res.sendStatus(201);

    } catch {
        res.sendStatus(500);
    }


})

app.get("/messages", async(req, res) => {

    const { limit } = req.query;
    const { user } = req.headers;
    let messages;

    try {
        
        if (limit) { 
            
            messages = await messagescolletiosn.find({$or: [{to: "Todos"}, {to: user.toLowerCase()}, {from: user.toLowerCase()}, { type: "message"}]}).toArray();
            const lastMessages = messages.slice(-limit);
            res.send(lastMessages);
            return;
        }

        messages = await messagescolletiosn.find({$or: [{to: "Todos"}, {to: user.toLowerCase()}, {from: user.toLowerCase()}, { type: "message"}]}).toArray();
        res.send(messages);

    } catch {
    res.sendStatus(500)
    }
})


app.listen(5000, () => console.log("Server running in port 5000")); 