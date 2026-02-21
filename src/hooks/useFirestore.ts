import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  DocumentData,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useFirestore() {
  const getDocument = async (collectionName: string, id: string) => {
    const docRef = doc(db, collectionName, id);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
  };

  const getDocuments = async (
    collectionName: string,
    ...constraints: QueryConstraint[]
  ) => {
    const q = query(collection(db, collectionName), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  };

  const addDocument = async (collectionName: string, data: DocumentData) => {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: new Date(),
    });
    return docRef.id;
  };

  const updateDocument = async (
    collectionName: string,
    id: string,
    data: Partial<DocumentData>
  ) => {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, data);
  };

  const deleteDocument = async (collectionName: string, id: string) => {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  };

  return {
    getDocument,
    getDocuments,
    addDocument,
    updateDocument,
    deleteDocument,
    // Re-export query helpers for convenience
    where,
    orderBy,
    limit,
  };
}
