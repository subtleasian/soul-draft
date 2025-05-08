import { useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";

export default function FixTimestamps({ user }) {
  useEffect(() => {
    const fixOldTimestamps = async () => {
      const snapshot = await getDocs(collection(db, "journalEntries"));
      let fixedCount = 0;

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();

        if (data.time instanceof Timestamp) continue;

        const parsedDate = new Date(data.time);
        if (isNaN(parsedDate)) {
          console.warn(`Could not parse time for doc ${docSnap.id}`);
          continue;
        }

        await updateDoc(doc(db, "journalEntries", docSnap.id), {
          time: Timestamp.fromDate(parsedDate),
        });

        console.log(`Updated doc ${docSnap.id}`);
        fixedCount++;
      }

      console.log(`✅ Fixed ${fixedCount} documents.`);
    };

    fixOldTimestamps();
  }, []);

  if (user?.email !== "your.email@example.com") {
    return <p>Unauthorized</p>;
  }

  return (
    <div className="p-4 border border-red-500 bg-red-50">
      <h2 className="font-bold text-red-700">Developer Tool: Fix Timestamps</h2>
      <p>Running now... Check console for progress.</p>
    </div>
  );
}
