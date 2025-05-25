import { openDB } from 'idb';
import styles from './styles.module.css'
import { useCallback, useEffect, useState } from 'react';

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
  blob?: Blob;
  url?: string;
  filename?: string;
  type: ETypeImage
}

export const UploadImage = (props: React.ButtonHTMLAttributes<HTMLDivElement>) => {
  const { className, ...restProps } = props
  const [images, setImages] = useState<ImageItem[]>([]);

  const getAllImages = async () => {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const images = await store.getAll();
    await tx.done;
    return images;
  }

  const createImage = async (image: ImageItem) => {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    await store.add(image);
    await tx.done;
  }

  const updateImage = async (image: ImageItem) => {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    await store.put(image);
    await tx.done;
  }

  const removeImage = async (id: string) => {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    await store.delete(id);
    await tx.done;
  }

  const triggerSync = async () => {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration: any = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-images');
        console.log('Sync registered');
      } catch (error) {
        console.error('Sync registration failed:', error);
      }
    }
  }

  const saveImage = async (file: File) => {
    const id = Date.now().toString();
    const renamedFile = new File([file], `${id}.${file.name.split('.').pop()}`, { type: file.type });

    const newImage = { id, blob: renamedFile, type: ETypeImage.LOCAL_ONLY }
    await createImage(newImage);
    setImages(prev => [...prev, newImage]);

    await triggerSync();
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
      }
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const fetchData = async () => {
    try {
      const localImage = await getAllImages();
      const cloudData = await fetch("http://localhost:4000/api/photos");
      const cloudImage = await cloudData.json();

      const convertImage = cloudImage.map((item: any) => ({
        id: item.filename.replace(/\.[^/.]+$/, ''),
        url: item.url,
        type: ETypeImage.SYNCED,
      }));

      const cloudIds = new Set(convertImage.map((img: any) => img.id));

      const removeListImages: ImageItem[] = [];
      const filteredLocal: ImageItem[] = [];

      for (const item of localImage) {
        if (cloudIds.has(item.id)) {
          removeListImages.push(item);
        } else {
          filteredLocal.push(item);
        }
      }

      await Promise.all(removeListImages.map(item => removeImage(item.id)));

      setImages([...filteredLocal, ...convertImage]);
      console.log(convertImage);


    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu từ IndexedDB:", error);
    }
  };
  useEffect(() => {
    const registerServiceWorkerAndSync = async () => {
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('✅ Service Worker registered:', registration);

          // Trigger initial sync
          await triggerSync();
        } catch (error) {
          console.error('❌ Đăng ký Service Worker hoặc Sync thất bại:', error);
        }
      } else {
        console.warn('⚠️ Trình duyệt không hỗ trợ Service Worker hoặc Background Sync');
      }
    };

    fetchData();
    registerServiceWorkerAndSync();
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SYNC_COMPLETED' && event.data.changed) {
        console.log(event.data);
        setImages(prev => prev.map(image => ({ ...image, type: event.data.changed.id === image.id ? event.data.changed.type : image.type })));
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <div className={`${className} ${styles.uploadImage}`} {...restProps}>
      <input type="file" accept="image/*" multiple onChange={handleFileChange} />
      <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {images.map(image => {
          const url = image.blob ? URL.createObjectURL(image.blob) : `http://localhost:4000${image.url}`;
          return (
            <div style={{ position: 'relative' }} key={image.id}>
              <img
                src={url}
                alt="Uploaded preview"
                style={{ maxWidth: 150, maxHeight: 150, objectFit: 'cover' }}
                onLoad={() => URL.revokeObjectURL(url)}
              />
              <span style={{
                position: "absolute", top: 5, right: 5, color: (() => {
                  switch (image.type) {
                    case ETypeImage.LOCAL_ONLY:
                      return 'red';
                    case ETypeImage.UPLOADING:
                      return 'orange';
                    case ETypeImage.SYNCED:
                      return 'green';
                    case ETypeImage.ERROR:
                      return 'black';
                    default:
                      return 'black';
                  }
                })(),
                textShadow: '0 0 4px rgba(0, 0, 0, 0.7)',
                fontWeight: 'bold',
                padding: '2px 6px',
                borderRadius: 4,
                fontSize: 12
              }}>{image.type}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}