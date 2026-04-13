import { db } from '../firebase/config';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  query,
  orderBy,
  serverTimestamp,
  where
} from 'firebase/firestore';

export interface SegmentData {
  id?: string;
  caseId: string;
  time: number;
  end: number;
  speaker: string;
  text: string;
  importance?: 'critical' | 'normal';
}

export interface TimelineEventData {
  id?: string;
  caseId: string;
  time: string;
  type: 'info' | 'speaker' | 'alert' | 'legal';
  title: string;
  desc: string;
  iconName?: string;
  createdAt?: any;
}

const SEGMENTS_COLLECTION = 'segments';
const EVENTS_COLLECTION = 'events';

// ============== TRASCRIZIONI (Segments) ==============

export const getSegmentsByCaseId = async (caseId: string): Promise<SegmentData[]> => {
  try {
    const q = query(
      collection(db, SEGMENTS_COLLECTION), 
      where('caseId', '==', caseId),
      orderBy('time', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as SegmentData));
  } catch (error) {
    console.error("Error fetching segments:", error);
    return [];
  }
};

export const addSegment = async (segmentData: Omit<SegmentData, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, SEGMENTS_COLLECTION), {
      ...segmentData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding segment:", error);
    throw error;
  }
};


// ============== TIMELINE (Events) ==============

export const getEventsByCaseId = async (caseId: string): Promise<TimelineEventData[]> => {
  try {
    const q = query(
      collection(db, EVENTS_COLLECTION), 
      where('caseId', '==', caseId),
      orderBy('time', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as TimelineEventData));
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
};

export const addEvent = async (eventData: Omit<TimelineEventData, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(db, EVENTS_COLLECTION), {
      ...eventData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding event:", error);
    throw error;
  }
};
