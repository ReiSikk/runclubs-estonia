import { getStorage } from "firebase-admin/storage";
import { adminApp } from "@/app/lib/firebase/firebaseAdmin";

export async function uploadImageToStorage(file: File, folder: string, fileName: string): Promise<string> {
  const bucket = getStorage(adminApp).bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
  const fileRef = bucket.file(`${folder}/${fileName}`);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await fileRef.save(buffer, {
    contentType: file.type,
    metadata: { contentType: file.type },
  });

  await fileRef.makePublic();
  return `https://storage.googleapis.com/${bucket.name}/${fileRef.name}`;
}