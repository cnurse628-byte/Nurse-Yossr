const COMPTE_SERVICE = {
  "type": "service_account",
  "project_id": "nurse-yossr",
  "private_key_id": "b4edbdb46b23635a3fa6123e104b1ecd85e0fef6",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCqYIH+7lhdSyay\n5ttVW8L+2k4M9EIy1O3ZWh87EqVctV+hnK8ThtvHqIsZnnnUZY1VyUDqtn3v4LG/\nhC0bGjzUlNDyiS1rq2MFMNGO1MTEK1UmbxRPpOpnx4RTPgrekUK5/cKOGLePfIMw\nEfHTLreEmguEElIUIA3e2W6hFJIzVsuQe6gBUZPioTeFEPd2HBt2xDtexFhgaUPU\nZSVGlVQ9XyzOSqzVcHdv85U3/9++QVfoy7wtuLg3LpkjRIo3KYibdSbYq+wJcQjU\nq930G1vkwIa7epYlQq6U2Jrf0OPnIktVYo8nVzxg2bzJuI7x9MkbgizwgYQRlqhn\nOnN2PwbxAgMBAAECggEAKhyBdQfnWmPVVFnAM6hjGYfOy9/hrtu3UEY4uuqgabpA\nwVrPYTWvg/lyLCph9XAGT4JXY8woc45nkK00UuMYzvhbbt8eFWM+rc1Dtph7a/tD\n6CSDci4SbAVB/Ss0F4/y3LLOkD2mvTXq3QpKaca9wG4s03+NvwCvPPokIHdLrZlq\ndIAL0mSZulS+4uqp/ifkpjPu8FM0l0VgEHODNSbnjBpV2RTkgQA89088EBkSKxUo\nmuBIObEXTRxMMpW2otMZgrN0LZS/Fu3FU9003ArcZ/+scjHyhV3YIn/739/fEAOq\nTaXeHC04b9JggnwEvPoYeYFuL3y6XqmCpr8n1n59MwKBgQDeYTcrKwtlRVyKb3wO\nLQNxWmHwko7fZASrGB6ordLTgskTnWux9wWf5bcb9Tzw3H0AUPPmAjYlI3CGcQcm\nUP+jha2FKMBe5uVLZrpVMu+Opg8ij4yWttCMEHwic4Op/0Poi4Ty5T1szR3iW2/F\noLXzUyFNfyHQNiuS5PWpVSqoYwKBgQDEIp/WUeDAI1Vck5XslWA2RDt1rXXFsM+p\nuDJbnoS+7toOW852p6ES2/qY1PAUrLEzXLDWuz3oE0xj9kDhIPtvFIwz66DqH10T\nJdpy8vlE/FCuFK0GPvD8Ld1KTTAPn8aEVdim2qKZmRwuTfDtxvChTd4p00ve8sEz\n3TkwKjmRmwKBgQCHnoImsXmhqUtmodbmTk1rM9PHA5peYoD2Vx9bf6azl29Jpxem\n0R99BHtHcahYvB7/sl8MRwz+WT6mvwe9NmixMTVBoDixp97uvRemHgo61MsmKKV0\nxMkqomMSH6CMbEDd8TiDaYqsb+tpwJnJzNkqK+iDeqUEdgTc8QVg36/EQQKBgCKU\nAB3mvXriP9BcbJgTFa07hkgO1q6Np27CfI5OehS3Q1Y4tUOR9gG/KoT7NYBPmcX2\nV27j/9wEWvlclr+Z8vn4Y2db6TidYulXSRXu5CdXXFn0ZzSssAulglfxF8IJZxQ5\nlkKEVRpDNgar0wf4hL/LXJl/GOcrYQhlvglRyGh1AoGAKi1cmnSvmQzrGjZDaN0A\no2z0mtSWXwzQyfyKy/cTiZVha1b+6wF4HMCK9JXV1x0gU9Pj98DQKf7Jiplios6p\nHIaP1L2dpqVH/oJwn+Ha9ULVT83vAyTiw8Qf2OORUJ5BxKjH0YIxGvH61AM4VRjs\nVnakzfqJCsWzQ0HQeOcZCkg=\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@nurse-yossr.iam.gserviceaccount.com",
  "client_id": "100853478389957738875",
  "token_uri": "https://oauth2.googleapis.com/token"
};

const PROJET  = "nurse-yossr";
const APP_URL = "https://cnurse628-byte.github.io/Nurse-Yossr/";

const FENETRE = 8;


function envoyerRappels() {
  const jeton = accessToken_();
  const users = listerUtilisateurs_(jeton);
  if (!users.length) { console.log("Aucun utilisateur."); return; }
  users.forEach(u => traiter_(u, jeton));
}

/** Efface la mémoire du jour (utile pendant les essais). */
function remettreAZero() {
  PropertiesService.getScriptProperties().deleteAllProperties();
  console.log("Mémoire effacée.");
}

/** À lancer une seule fois, à la main, pour vérifier que tout est branché. */
function verifier() {
  const jeton = accessToken_();
  console.log("Jeton Google : OK");
  const users = listerUtilisateurs_(jeton);
  console.log("Utilisateurs trouvés : " + users.length);
  users.forEach(u => {
    const p = u.push || {};
    const jours = Object.keys(p.days || {});
    console.log("— " + u.id
      + " | appareils : " + (u.fcmTokens || []).length
      + " | plan : " + (jours.length ? jours[0] + " → " + jours[jours.length - 1] : "aucun")
      + " | dhikr : " + (p.dhikr && p.dhikr.on ? "toutes les " + p.dhikr.every + " min" : "non"));
  });
}

// ─────────────────────────────────────────────────────────────
// 3) LOGIQUE
// ─────────────────────────────────────────────────────────────

function traiter_(u, jeton) {
  const p = u.push;
  if (!p) return;

  const tokens = (u.fcmTokens || []).map(x => x && x.t).filter(Boolean);
  if (!tokens.length) return;

  // heure locale de l'utilisatrice
  const local = new Date(Date.now() + Number(p.tzOffset || 0) * 60000);
  const cle   = Utilities.formatDate(local, "UTC", "yyyy-MM-dd");
  const mins  = local.getUTCHours() * 60 + local.getUTCMinutes();
  const jour  = (u.days || {})[cle] || {};

  // mémoire du jour : ce qui est déjà parti ne repart pas
  const props  = PropertiesService.getScriptProperties();
  const memCle = "envoi_" + u.id;
  let mem;
  try { mem = JSON.parse(props.getProperty(memCle) || "{}"); } catch (e) { mem = {}; }
  if (mem.date !== cle) mem = { date: cle, ids: [], dhikr: 0 };

  // ---- rappels du plan ----
  const items = (p.days || {})[cle] || [];
  items.forEach(it => {
    const id = it.ty + "@" + it.at;
    if (mem.ids.indexOf(id) >= 0) return;

    let ecart = mins - hm_(it.at);
    if (ecart < -720) ecart += 1440;             // rappel de nuit passé minuit
    if (ecart < 0 || ecart > FENETRE) return;

    mem.ids.push(id);                            // vu : on ne le rejouera pas
    if (dejaFait_(it, jour, p)) return;
    tokens.forEach(tk => envoyer_(jeton, tk, it.t, it.b, it.p));
  });

  // ---- dhikr régulier ----
  const dh = p.dhikr || {};
  if (dh.on && eveillee_(mins, hm_(dh.wake), hm_(dh.bed))) {
    const ecoule = Date.now() - Number(mem.dhikr || 0);
    const attendu = Math.max(5, Number(dh.every) || 10) * 60000;
    if (ecoule >= attendu - 60000) {             // 1 min de tolérance
      const liste = p.adhkar || [];
      if (liste.length) {
        const d = liste[Math.floor(Math.random() * liste.length)];
        tokens.forEach(tk => envoyer_(jeton, tk, d.a, "📿 " + d.n, "p-dhikr"));
        mem.dhikr = Date.now();
      }
    }
  }

  props.setProperty(memCle, JSON.stringify(mem));
}

/** Ne pas rappeler ce qui est déjà fait. */
function dejaFait_(it, jour, p) {
  if (it.ty === "eau")   return Number(jour.water || 0) >= Number(p.goal || 2000);
  if (it.ty === "repas") return !!((jour.meals || {})[it.m]);
  if (it.ty === "coran") return Number(jour.quran || 0) >= 286;
  if (it.ty === "mood")  return jour.mood !== null && jour.mood !== undefined;
  return false;
}

function eveillee_(n, a, b) { return a < b ? (n >= a && n <= b) : (n >= a || n <= b); }
function hm_(s) { const p = String(s || "0:0").split(":"); return (+p[0]) * 60 + (+p[1] || 0); }

// ─────────────────────────────────────────────────────────────
// 4) FIREBASE
// ─────────────────────────────────────────────────────────────

function accessToken_() {
  if (!COMPTE_SERVICE || !COMPTE_SERVICE.private_key)
    throw new Error("Clé de service manquante : colle le fichier .json dans CLE_JSON.");
  const now = Math.floor(Date.now() / 1000);
  const enTete = b64_(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const corps  = b64_(JSON.stringify({
    iss: COMPTE_SERVICE.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging"
         + " https://www.googleapis.com/auth/datastore",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now
  }));
  const signature = Utilities.base64EncodeWebSafe(
    Utilities.computeRsaSha256Signature(enTete + "." + corps, COMPTE_SERVICE.private_key)
  ).replace(/=+$/, "");

  const rep = UrlFetchApp.fetch("https://oauth2.googleapis.com/token", {
    method: "post",
    payload: {
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: enTete + "." + corps + "." + signature
    },
    muteHttpExceptions: true
  });
  const d = JSON.parse(rep.getContentText());
  if (!d.access_token) throw new Error("Google a refusé la clé : " + rep.getContentText());
  return d.access_token;
}

function listerUtilisateurs_(jeton) {
  const url = "https://firestore.googleapis.com/v1/projects/" + PROJET
            + "/databases/(default)/documents/users?pageSize=50";
  const rep = UrlFetchApp.fetch(url, {
    headers: { Authorization: "Bearer " + jeton }, muteHttpExceptions: true
  });
  const d = JSON.parse(rep.getContentText());
  if (d.error) throw new Error("Firestore : " + d.error.message);
  return (d.documents || []).map(doc => {
    const o = decoder_({ mapValue: { fields: doc.fields } });
    o.id = doc.name.split("/").pop();
    return o;
  });
}

function envoyer_(jeton, token, titre, texte, page) {
  const rep = UrlFetchApp.fetch(
    "https://fcm.googleapis.com/v1/projects/" + PROJET + "/messages:send", {
      method: "post",
      contentType: "application/json",
      headers: { Authorization: "Bearer " + jeton },
      muteHttpExceptions: true,
      payload: JSON.stringify({
        message: {
          token: token,
          notification: { title: titre, body: texte },
          data: { page: page || "p-home" },
          webpush: {
            headers: { Urgency: "high", TTL: "1800" },
            fcmOptions: { link: APP_URL }
          }
        }
      })
    });
  if (rep.getResponseCode() >= 300) {
    console.log("Envoi refusé (" + rep.getResponseCode() + ") : " + rep.getContentText());
  }
}

/** Firestore renvoie des valeurs typées : on les remet à plat. */
function decoder_(v) {
  if (v.stringValue    !== undefined) return v.stringValue;
  if (v.integerValue   !== undefined) return Number(v.integerValue);
  if (v.doubleValue    !== undefined) return Number(v.doubleValue);
  if (v.booleanValue   !== undefined) return v.booleanValue;
  if (v.timestampValue !== undefined) return v.timestampValue;
  if (v.nullValue      !== undefined) return null;
  if (v.arrayValue) return (v.arrayValue.values || []).map(decoder_);
  if (v.mapValue) {
    const o = {}, f = v.mapValue.fields || {};
    for (const k in f) o[k] = decoder_(f[k]);
    return o;
  }
  return null;
}

function b64_(s) {
  return Utilities.base64EncodeWebSafe(s).replace(/=+$/, "");
}
