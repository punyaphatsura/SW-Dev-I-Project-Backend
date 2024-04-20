import admin from "firebase-admin";

function formatFirebasePrivateKey(key) {
  if (key) {
    return key.replace(/\\n/g, "\n");
  }

  return "";
}

export function createFirebaseAdminApp(params) {
  const privateKey = formatFirebasePrivateKey(params.privateKey);

  // if already created, return the same instance
  if (admin.apps.length > 0) {
    return admin.app();
  }

  // create certificate
  const cert = admin.credential.cert({
    projectId: params.projectId,
    clientEmail: params.clientEmail,
    privateKey,
  });

  // initialize admin app
  return admin.initializeApp({
    credential: cert,
    projectId: params.projectId,
  });
}

export async function initializeAdmin() {
  const params = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
  };

  // console.log(params);

  return createFirebaseAdminApp(params);
}
