import * as admin from "firebase-admin";
import serviceAccount from "./servicekey.json";

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

export default admin