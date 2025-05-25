importScripts('/idb.umd.js');

self.addEventListener('sync', event => {
  if (event.tag === 'sync-images') {
    event.waitUntil(syncImages());
  }
});


async function updateImage(db, image, newData) {
  try {
    const tx = db.transaction('images', 'readwrite');
    const store = tx.objectStore('images');
    await store.put({ ...image, ...newData });
    await tx.done;
  } catch (error) {
    console.error('Failed to update image in IndexedDB:', image.id, error);
    throw error;
  }
}

async function notifyClients(data) {
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage(data);
  });
}

async function syncImages() {
  try {
    const db = await idb.openDB('khoa-dev', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('images')) {
          db.createObjectStore('images', { keyPath: 'id' });
        }
      },
    });

    // Lấy tất cả images
    let images;
    {
      const tx = db.transaction('images', 'readonly');
      const store = tx.objectStore('images');
      images = await store.getAll();
      await tx.done;
    }

    if (!Array.isArray(images)) {
      console.warn('No images found or invalid data returned from IndexedDB', images);
      return;
    }

    const localImages = images.filter(img => img.type === 'local-only' || img.type === 'error' || img.type === 'uploading');

    for (const image of localImages) {
      try {
        await updateImage(db, image, { type: 'uploading' });
        await notifyClients({ type: 'SYNC_COMPLETED', changed: { id: image.id, type: 'uploading' } });

        if (!image.blob) {
          throw new Error('Image blob missing or invalid');
        }

        const formData = new FormData();
        formData.append('photo', image.blob);

        const response = await fetch('http://localhost:4000/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed with status: ${response.status}`);
        }

        const result = await response.json();

        await updateImage(db, image, {
          type: 'synced',
          url: result.url,
          filename: result.filename,
        });
        await notifyClients({ type: 'SYNC_COMPLETED', changed: { id: image.id, type: 'synced' } });

      } catch (error) {
        console.error('Sync failed for image:', image.id, error);
        try {
          await updateImage(db, image, { type: 'error' });
          await notifyClients({ type: 'SYNC_COMPLETED', changed: { id: image.id, type: 'error' } });
        } catch (e) {
          console.error('Failed to update image status to error:', image.id, e);
        }
      }
    }
  } catch (error) {
    console.error('Sync process failed:', error);
  }
}
