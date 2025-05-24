self.addEventListener('push', function(event) {
  let data = {};
  try {
    data = event.data.json();
  } catch (e) {
    data = {
      title: 'Notifikasi',
      options: {
        body: 'Ada notifikasi baru.',
      },
    };
  }

  const title = data.title || 'Notifikasi';
  const options = data.options || {
    body: 'Ada notifikasi baru.',
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});