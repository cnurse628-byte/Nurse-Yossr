/**
 * Nurse Yossr — envoi des rappels quand l'application est fermée.
 *
 * À coller dans Google Apps Script (script.google.com).
 * Tourne toutes les 5 minutes, lit le plan déposé par l'app dans Firestore,
 * et envoie les rappels dus via Firebase Cloud Messaging.
 *
 * Installation : voir README.md, section « Rappels app fermée ».
 */

// ─────────────────────────────────────────────────────────────
// 1) À REMPLIR
// ─────────────────────────────────────────────────────────────

// Firebase → ⚙️ Paramètres du projet → Comptes de service →
// « Générer une nouvelle clé privée » → ouvre le fichier .json → colle tout ici.
const COMPTE_SERVICE = {
  "type": "service_account",
  "project_id": "COLLE_ICI_LE_CONTENU_DU_FICHIER_JSON",
  "private_key_id": "",
  "private_key": "",
  "client_email": "",
  "client_id": ""
};

const PROJET  = "nurse-yossr";
const APP_URL = "https://cnurse628-byte.github.io/Nurse-Yossr/";

// Le déclencheur tourne toutes les 5 minutes. La fenêtre est un peu plus large
// (Google ne déclenche jamais à la seconde près) et une mémoire empêche
// d'envoyer deux fois le même rappel.
const FENETRE = 8;

// ─────────────────────────────────────────────────────────────
// 2) LA FONCTION À DÉCLENCHER (choisis-la dans le déclencheur)
// ─────────────────────────────────────────────────────────────

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
