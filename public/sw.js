importScripts("/idb.umd.js");

const DB_NAME = "khoa-dev";
const STORE_NAME = "images";

self.addEventListener("sync", (event) => {
  if (event.tag === "sync-images") {
    event.waitUntil(syncImages());
  }
});

async function updateImage(db, image, newData) {
  try {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    await store.put({ ...image, ...newData });
    await tx.done;
  } catch (error) {
    console.error("Failed to update image in IndexedDB:", image.id, error);
    throw error;
  }
}

async function deleteImage(db, id) {
  try {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    await store.delete(id);
    await tx.done;
  } catch (error) {
    console.error("Failed to delete image in IndexedDB:", id, error);
    throw error;
  }
}

async function notifyClients(data) {
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage(data);
  });
}

async function syncImages() {
  try {
    const db = await idb.openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      },
    });

    // Lấy tất cả images
    let images;
    {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      images = await store.getAll();
      await tx.done;
    }

    if (!Array.isArray(images)) {
      console.warn(
        "No images found or invalid data returned from IndexedDB",
        images
      );
      return;
    }

    const syncedImages = images.filter((img) => img.type === "synced");
    for (const img of syncedImages) {
      try {
        await deleteImage(db, img.id);
        console.log("Deleted synced image:", img.id);
      } catch (e) {
        console.warn("Failed to delete synced image:", img.id, e);
      }
    }

    const localImages = images.filter(
      (img) =>
        img.type === "local-only" ||
        img.type === "error" ||
        img.type === "uploading"
    );

    for (const image of localImages) {
      try {
        await updateImage(db, image, { type: "uploading" });
        await notifyClients({
          type: "SYNC_COMPLETED",
          changed: { id: image.id, type: "uploading" },
        });

        if (!image.blob) {
          throw new Error("Image blob missing or invalid");
        }

        const formData = new FormData();
        formData.append("photo", image.blob);

        const response = await fetch(
          "https://image-fake-upload.onrender.com/api/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error(`Upload failed with status: ${response.status}`);
        }

        const result = await response.json();
        if (result && result.url) {
          await notifyClients({
            type: "SYNC_COMPLETED",
            changed: { id: image.id, type: "synced" },
          });
          await updateImage(db, image, {
            type: "synced",
            url: result.url,
            filename: result.filename,
          });
          await deleteImage(db, image.id);
        } else {
          await updateImage(db, image, { type: "error" });
        }
      } catch (error) {
        console.error("Sync failed for image:", image.id, error);
        try {
          await updateImage(db, image, { type: "error" });
          await notifyClients({
            type: "SYNC_COMPLETED",
            changed: { id: image.id, type: "error" },
          });
        } catch (e) {
          console.error("Failed to update image status to error:", image.id, e);
        }
      }
    }
  } catch (error) {
    console.error("Sync process failed:", error);
  }
}
