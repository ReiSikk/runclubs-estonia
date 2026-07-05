import { onSchedule } from "firebase-functions/v2/scheduler";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import {setGlobalOptions} from "firebase-functions";
import { logger } from "firebase-functions/v2";

// Initialize Firebase Admin
initializeApp();


// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
setGlobalOptions({ maxInstances: 10 });

const db = getFirestore();

/**
 * Delete events older than 14 days
 * Runs daily at midnight (Europe/Tallinn timezone)
 */
export const deleteOldEvents = onSchedule(
  {
    schedule: "0 0 * * *", // Every day at 00:00
    timeZone: "Europe/Tallinn",
    maxInstances: 1, // Only need 1 instance for cleanup
    region: "europe-west1", // Belgium
  },
  async () => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 14);
    const cutoffISO = cutoffDate.toISOString().split("T")[0];

    logger.info(`Deleting events older than ${cutoffISO}`);

    try {
      const snapshot = await db
        .collection("events")
        .where("date", "<", cutoffISO)
        .get();

      if (snapshot.empty) {
        logger.info("No old events to delete");
        return;
      }

      const batch = db.batch();
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();

      logger.info(`Deleted ${snapshot.size} old events`);
    } catch (error) {
      logger.error("Error deleting old events:", error);
      throw error;
    }
  }
);