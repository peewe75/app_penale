import { db } from '../firebase/config';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

const CASES_COLLECTION = 'cases';

export interface CaseData {
  id?: string;
  title: string;
  client: string;
  procedureNumber: string;
  category: 'penale' | 'civile' | 'amministrativo' | 'stragiudiziale';
  status: 'active' | 'archived' | 'pending';
  lastUpdate?: any;
  createdAt?: any;
  audioCount?: number;
  audioUrl?: string;
}

export const getCases = async (): Promise<CaseData[]> => {
  try {
    const q = query(collection(db, CASES_COLLECTION), orderBy('lastUpdate', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as CaseData));
  } catch (error) {
    console.error("Error fetching cases:", error);
    return [];
  }
};

export const getCaseById = async (id: string): Promise<CaseData | null> => {
  try {
    const docRef = doc(db, CASES_COLLECTION, id);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as CaseData;
    }
    return null;
  } catch (error) {
    console.error("Error fetching case:", error);
    return null;
  }
};

export const createCase = async (caseData: Omit<CaseData, 'id' | 'createdAt' | 'lastUpdate'>) => {
  try {
    const docRef = await addDoc(collection(db, CASES_COLLECTION), {
      ...caseData,
      audioCount: caseData.audioCount || 0,
      createdAt: serverTimestamp(),
      lastUpdate: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating case:", error);
    throw error;
  }
};

export const updateCaseData = async (id: string, updateData: Partial<CaseData>) => {
  try {
    const docRef = doc(db, CASES_COLLECTION, id);
    await updateDoc(docRef, {
      ...updateData,
      lastUpdate: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error updating case:", error);
    throw error;
  }
};

export const deleteCase = async (id: string) => {
  try {
    const docRef = doc(db, CASES_COLLECTION, id);
    await deleteDoc(docRef);
    // Note: Non cancella le sotto-collezioni (trascrizioni/audio) automaticamente 
    // su Firebase Web Client, andrebbero aggiunte cloud functions per pulizia completa
    return true;
  } catch (error) {
    console.error("Error deleting case:", error);
    throw error;
  }
};
