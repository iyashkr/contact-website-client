import admin from "@/lib/dbconnect";
import axios from "axios";
const auth = admin.auth()


export default async function verifyToken(req, res) {


    if (req.method === "POST") {

        try {
            const token = req.body.token;
            const decodedToken = await auth.verifyIdToken(token);
            res.status(200).json({ uid: decodedToken.uid });
        } catch (error) {
            res.status(500).json(error)
        }
    }
}
