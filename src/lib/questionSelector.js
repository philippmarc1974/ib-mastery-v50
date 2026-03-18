import { db } from './firebase';
import {
  collection, query, where, getDocs,
  doc, updateDoc, arrayUnion, limit
} from 'firebase/firestore';

/**
 * Select a question from Firestore bank.
 * Falls back to API ONLY when bank is exhausted for this topic.
 */
export async function selectQuestion({ subject, topic, paperType, difficulty = 'standard', userId }) {
  try {
    if (!db) return { question: null, source: 'no-db', remaining: 0 };

    // Firestore docs use 'paper' field (e.g. 'P1', 'P2'). 'paperType' is an older alias.
    const constraints = [
      where('subject', '==', subject),
      where('paper', '==', paperType),
      limit(100)
    ];
    if (topic && topic !== 'Any') {
      constraints.splice(2, 0, where('topic', '==', topic));
    }

    const q = query(collection(db, 'questionBank'), ...constraints);
    const snapshot = await getDocs(q);
    const allQuestions = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    if (allQuestions.length === 0) {
      return { question: null, source: 'exhausted', remaining: 0 };
    }

    // Filter unseen by this user
    const unseen = allQuestions.filter(q => !Array.isArray(q.seenBy) || !q.seenBy.includes(userId));

    if (unseen.length > 0) {
      const preferred = unseen.filter(q => q.difficulty === difficulty);
      const pool = preferred.length > 0 ? preferred : unseen;
      const selected = pool[Math.floor(Math.random() * pool.length)];

      // Mark as seen (non-blocking)
      markQuestionSeen(selected.id, userId).catch(() => {});

      return {
        question: selected,
        source: 'bank',
        remaining: unseen.length - 1
      };
    }

    return { question: null, source: 'exhausted', remaining: 0 };
  } catch (err) {
    console.error('selectQuestion error:', err);
    return { question: null, source: 'error', remaining: 0 };
  }
}

export async function markQuestionSeen(questionId, userId) {
  if (!questionId || !userId || !db) return;
  await updateDoc(doc(db, 'questionBank', questionId), {
    seenBy: arrayUnion(userId)
  });
}

/**
 * Batch-fetch N questions from Firestore for a study session.
 * Single query (not N separate calls). Falls back gracefully.
 *
 * Firestore subject names differ from app display names for Math:
 *   app: 'Maths AI HL'  →  Firestore: 'mathAIHL'
 * All others match exactly.
 */
export async function selectQuestionBatch({ subject, topic, count = 7, userId }) {
  try {
    if (!db) return [];

    // Map app subject display names → Firestore values
    const SUBJECT_MAP = {
      'Maths AI HL': 'mathAIHL',
      'Mathematics AI HL': 'mathAIHL',
    };
    const firestoreSubject = SUBJECT_MAP[subject] || subject;

    const q = query(
      collection(db, 'questionBank'),
      where('subject', '==', firestoreSubject),
      limit(400)
    );
    const snapshot = await getDocs(q);
    let docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    if (docs.length === 0) return [];

    // Client-side topic filter — case-insensitive contains
    if (topic && topic !== 'Any' && topic !== 'General' && !topic.startsWith('Full ')) {
      const tl = topic.toLowerCase();
      const filtered = docs.filter(d =>
        d.topic?.toLowerCase().includes(tl) ||
        d.subtopic?.toLowerCase().includes(tl)
      );
      if (filtered.length >= 3) docs = filtered;
      // else use full subject pool (better than returning nothing)
    }

    // Prefer unseen questions
    const unseen = docs.filter(d => !Array.isArray(d.seenBy) || !d.seenBy.includes(userId));
    const pool = unseen.length >= count ? unseen : docs;

    // Shuffle and take count
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, count);

    // Mark as seen (non-blocking)
    if (userId) {
      shuffled.forEach(q => markQuestionSeen(q.id, userId).catch(() => {}));
    }

    return shuffled;
  } catch (err) {
    console.error('selectQuestionBatch error:', err);
    return [];
  }
}

export async function getTopicExhaustion({ subject, topic, paperType, userId }) {
  if (!db) return { total: 0, seen: 0, remaining: 0, exhausted: true, percentComplete: 0 };

  const constraints = [
    where('subject', '==', subject),
    where('paperType', '==', paperType),
  ];
  if (topic && topic !== 'Any') constraints.push(where('topic', '==', topic));

  const snapshot = await getDocs(query(collection(db, 'questionBank'), ...constraints));
  const all = snapshot.docs.map(d => d.data());
  const total = all.length;
  const seen = all.filter(q => Array.isArray(q.seenBy) && q.seenBy.includes(userId)).length;

  return {
    total,
    seen,
    remaining: total - seen,
    exhausted: total > 0 && (total - seen) === 0,
    percentComplete: total > 0 ? Math.round((seen / total) * 100) : 0,
  };
}
