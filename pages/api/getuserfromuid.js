import admin from "@/lib/dbconnect";
const auth = admin.auth()


export default async function Getuserfromuid(req, res) {

    if (req.method === "POST") {
        const uid = req.body.uid;
        try {
            const userRecord = await auth.getUser(uid);
            res.status(200).json(userRecord)
        } catch (error) {
            res.status(500).json(error)

        }
    }
}
