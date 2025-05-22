import { openDB } from 'idb';
import styles from './styles.module.css'
import { useEffect, useState } from 'react';

const DB_NAME = 'khoa-dev';
const STORE_NAME = 'images';

const enum ETypeImage {
  LOCAL_ONLY = "local-only",
  UPLOADING = "uploading",
  SYNCED = "synced",
  ERROR = "error"
}

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
}

interface ImageItem {
  id: string;
  blob: Blob;
  type: ETypeImage
}

export const UploadImage = (props: React.ButtonHTMLAttributes<HTMLDivElement>) => {
  const { className, ...restProps } = props
  const [images, setImages] = useState<ImageItem[]>([]);

  const loadImages = async () => {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);

    const allImages: ImageItem[] = [];
    let cursor = await store.openCursor();

    while (cursor) {
      allImages.push(cursor.value);
      cursor = await cursor.continue();
    }
    setImages(allImages);
  };
  const saveImage = async (file: File) => {
    const db = await getDB();

    let tx = db.transaction(STORE_NAME, 'readwrite');
    let store = tx.objectStore(STORE_NAME);
    const id = Date.now().toString();
    const newImage = { id, blob: file, type: ETypeImage.LOCAL_ONLY }
    await store.put(newImage);
    await tx.done;
    setImages([...images, newImage])

    await uploadToServer(file, async () => {
      let tx = db.transaction(STORE_NAME, 'readwrite');
      let store = tx.objectStore(STORE_NAME);
      await store.delete(id);
      await tx.done;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => saveImage(file));
    }
  };

  const uploadToServer = async (data: any, callBack: any) => {
    const form = new FormData();
    form.append("photo", data);

    try {
      const res = await fetch("http://localhost:4000/api/upload", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        throw new Error(`Upload failed with status: ${res.status}`);
      }

      const result = await res.json();
      if (result && result.message) {
        callBack()
      }
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  useEffect(() => {
    const registerServiceWorkerAndSync = async () => {
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('✅ Service Worker registered:', registration);

          const readyReg: any = await navigator.serviceWorker.ready;
          await readyReg.sync.register('sync-images');
        } catch (error) {
          console.error('❌ Đăng ký Service Worker hoặc Sync thất bại:', error);
        }
      } else {
        console.warn('⚠️ Trình duyệt không hỗ trợ Service Worker hoặc Background Sync');
      }
    };

    registerServiceWorkerAndSync();
    loadImages();
  }, []);

  return (
    <div className={`${className} ${styles.uploadImage}`} {...restProps}>
      <input type="file" accept="image/*" multiple onChange={handleFileChange} />
      <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {images.map(image => {
          const url = URL.createObjectURL(image.blob);
          return (
            <img
              key={image.id}
              src={url}
              alt="Uploaded preview"
              style={{ maxWidth: 150, maxHeight: 150, objectFit: 'cover' }}
              onLoad={() => URL.revokeObjectURL(url)}
            />
          );
        })}
      </div>
    </div>
  );
}