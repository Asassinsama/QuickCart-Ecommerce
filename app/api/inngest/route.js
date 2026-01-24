import { serve } from "inngest/next";
import { inngest } from "@/config/inngest";
//import { syncUserCreation, syncUserDeletion, syncUserUpdation } from "@/inngest/functions/sync-user-creation";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    /* your functions will be passed here later! */
   /* syncUserCreation,
    syncUserUpdation,
    syncUserDeletion*/
  ],
});