import CONFIG from "../config";
import { getAccessToken } from "./auth";
import { generateSubscribeNotifButton, generateUnsubscribeNotifButton } from '../templates';
import Swal from "sweetalert2"; // Tambahkan import ini

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export async function subscribePushNotification(token) {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Service Worker tidak didukung browser ini.");
  }
  const registration = await navigator.serviceWorker.register("/sw.bundle.js");
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY),
  });

  // Kirim subscription ke backend dengan format yang benar
  const response = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.getKey('p256dh')
          ? btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh'))))
          : '',
        auth: subscription.getKey('auth')
          ? btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth'))))
          : '',
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Gagal subscribe notifikasi.");
  }
  return response.json();
}

export async function unsubscribePushNotification(token) {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;

  // Hapus subscription di backend
  await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ endpoint: subscription.endpoint }),
  });

  await subscription.unsubscribe();
}

export function initNotificationButtons() {
  const notifBtnContainer = document.querySelector('.user-menu');
  const subscribeBtn = document.getElementById('subscribeNotifBtn');
  const unsubscribeBtn = document.getElementById('unsubscribeNotifBtn');
  const token = getAccessToken();

  if (subscribeBtn) {
    subscribeBtn.onclick = async () => {
      try {
        Swal.fire({
          title: "Mengaktifkan Notifikasi...",
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
        await subscribePushNotification(token);
        notifBtnContainer.querySelector('#subscribeNotifBtn').outerHTML = generateUnsubscribeNotifButton();
        initNotificationButtons();
        Swal.fire({
          icon: "success",
          title: "Notifikasi Diaktifkan!",
          text: "Kamu akan menerima notifikasi dari aplikasi.",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Gagal Mengaktifkan Notifikasi",
          text: err.message,
        });
      }
    };
  }

  if (unsubscribeBtn) {
    unsubscribeBtn.onclick = async () => {
      try {
        Swal.fire({
          title: "Menonaktifkan Notifikasi...",
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
        await unsubscribePushNotification(token);
        notifBtnContainer.querySelector('#unsubscribeNotifBtn').outerHTML = generateSubscribeNotifButton();
        initNotificationButtons();
        Swal.fire({
          icon: "success",
          title: "Notifikasi Dinonaktifkan!",
          text: "Kamu tidak akan menerima notifikasi lagi.",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Gagal Menonaktifkan Notifikasi",
          text: err.message,
        });
      }
    };
  }
}