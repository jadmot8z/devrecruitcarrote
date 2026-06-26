// ============================================================
// DEVRECRUIT — Configuration Firebase
// ============================================================
// ⚠️  REMPLACE CES VALEURS par celles de ta console Firebase
//     Console : https://console.firebase.google.com
//     Projet → Paramètres → Général → Tes applications
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth }       from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore }  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage }    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const firebaseConfig = {
  apiKey:            "REMPLACE_PAR_TON_API_KEY",
  authDomain:        "REMPLACE_PAR_TON_AUTH_DOMAIN",
  projectId:         "REMPLACE_PAR_TON_PROJECT_ID",
  storageBucket:     "REMPLACE_PAR_TON_STORAGE_BUCKET",
  messagingSenderId: "REMPLACE_PAR_TON_SENDER_ID",
  appId:             "REMPLACE_PAR_TON_APP_ID"
};

const app  = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);
export const storage = getStorage(app);
