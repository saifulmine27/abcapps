import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signInWithCredential, signOut } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

const config = window.TAKAGUCHHI_FIREBASE_CONFIG || {};
const configured = ["apiKey", "authDomain", "projectId", "appId"].every(key =>
  typeof config[key] === "string" && config[key].length > 0 && !config[key].startsWith("YOUR_")
);

if (!configured) {
  window.dispatchEvent(new CustomEvent("takaguchhi-cloud-ready", { detail: { configured: false } }));
} else {
  const app = initializeApp(config);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const provider = new GoogleAuthProvider();
  const nativeGoogle = () => new Promise((resolve, reject) => {
    window.onNativeGoogleToken = token => token ? resolve(token) : reject(new Error("no-token"));
    window.onNativeGoogleError = code => reject(new Error("code " + code));
    window.AndroidAuth.googleSignIn();
  });
  const stateRef = user => doc(db, "users", user.uid, "appData", "main");

  const api = {
    configured: true,
    signIn: () => window.AndroidAuth
      ? nativeGoogle().then(token => signInWithCredential(auth, GoogleAuthProvider.credential(token)))
      : signInWithPopup(auth, provider),
    signOut: () => signOut(auth),
    saveState: state => setDoc(stateRef(auth.currentUser), {
      items: state.items,
      deletedIds: state.deletedIds,
      updatedAt: Date.now()
    })
  };
  window.dispatchEvent(new CustomEvent("takaguchhi-cloud-ready", { detail: api }));
  onAuthStateChanged(auth, async user => {
    window.dispatchEvent(new CustomEvent("takaguchhi-auth", { detail: { user: user ? { uid: user.uid, email: user.email, displayName: user.displayName } : null } }));
    if (!user) return;
    try {
      const snapshot = await getDoc(stateRef(user));
      window.dispatchEvent(new CustomEvent("takaguchhi-cloud-state", { detail: snapshot.exists() ? snapshot.data() : { items: [], deletedIds: {} } }));
    } catch (error) {
      window.dispatchEvent(new CustomEvent("takaguchhi-cloud-error", { detail: { message: error.code || "sync-failed" } }));
    }
  });
}
