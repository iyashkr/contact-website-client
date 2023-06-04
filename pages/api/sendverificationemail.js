import admin from "@/lib/dbconnect";
import axios from "axios";
const auth = admin.auth()


export default async function sendverificationemail(req, res) {


    if (req.method === "POST") {

        try {
            const useremail = req.body.email;
            console.log(useremail)
            const result = await auth.generateEmailVerificationLink(useremail);
            res.status(200).json({ success: true, result });
        } catch (error) {
            res.status(500).json(error)
        }
    }
}
