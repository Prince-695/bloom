import { useEffect, useRef } from "react";
import { useToast } from "../providers/toast";
import { checkForUpdate, updatesDisabled } from "../lib/update";

/**
 * Soft update notice after launch. Does not download or replace the binary.
 */
export function UpdateNotifier() {
  const toast = useToast();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current || updatesDisabled()) return;
    ran.current = true;

    void checkForUpdate()
      .then((info) => {
        if (!info.available) return;
        toast.show({
          message: `v${info.latestVersion} available — run /update`,
        });
      })
      .catch(() => {
        // Ignore network / GitHub errors on soft check
      });
  }, [toast]);

  return null;
}
