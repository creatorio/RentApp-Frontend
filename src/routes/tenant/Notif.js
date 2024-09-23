import { onMount } from "svelte";
let urlBase64ToUint8Array;
let send;
let subscription;
console.log(navigator);
urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};
const publicVapidKey =
  "BMG1_Cwy8C_JRweiURMlkCiYsdmfzzMfjt_fPk1QOUGBdssQJGpuy2rmrSobDQ0ZztHAzFzfNDTn34n_3QmroGM";
// Register SW, Register Push, Send Push
send = async (body, day, tenant, month) => {
  if ("serviceWorker" in navigator) {
    // Register Service Worker
    console.log("Registering service worker...");
    var register = await navigator.serviceWorker.register(
      "../../src/service-worker.js"
    );
    console.log("Service Worker Registered...");

    // Register Push
    console.log("Registering Push...");
    subscription = await register?.pushManager?.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
    });
    console.log("Push Registered...");

    // Send Push Notification
    console.log("Sending Push...");
    await fetch("https://rentapp-backend-3pnf.onrender.com/subscribe", {
      method: "POST",
      body: JSON.stringify({
        tenant: tenant,
        sub: subscription,
        day: day,
        month: month,
        notif: JSON.stringify({ title: "Rent Reminder", body: body }),
      }),
      headers: {
        "content-type": "application/json",
      },
    });
    console.log("Push Sent...");
  }
};
async function sendmonpa(paid, tenant) {
  if (!paid) {
    return;
  }
  await fetch("https://rentapp-backend-3pnf.onrender.com/subscribe", {
    method: "POST",
    body: JSON.stringify({
      sub: tenant,
      paid: paid,
    }),
    headers: {
      "content-type": "application/json",
    },
  });
  console.log("paid sent");
}
export default send;
export { sendmonpa };
