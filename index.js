import express, { json } from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv"
import joi from "joi";


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
const participants = db.collection("participants");
const messages = db.collection("messages");


app.post("/participants", async (req, res) => {

    const validation = userSchema.validate(req.body, { abortEarly: false });

    if (validation.error) {

    res.send(validation.error.message);
    return;
    }
    
    try {
        res.send("deu bom")
    } catch (error) {
        console.log("deu ruim");
    }

});


app.listen(5000, () => console.log("Server running in port 5000"));