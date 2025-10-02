// import React from "react";
// import { Navigate } from "react-router-dom";
// import { useAuth } from "../contexts/AuthContext";

// export default function RequirePremium({ children }) {
//   const { org } = useAuth();
//   if (!org) return <Navigate to="/" replace />;
//   const now = Date.now();
//   const sub = org.subscription || { tier: "free", expiresAt: 0 };
//   const isPremium = sub.tier === "premium" && sub.expiresAt > now;
//   if (!isPremium) {
//     // if not premium, redirect to a subscribe page or show an upsell modal route
//     return <Navigate to="/subscribe" replace />;
//   }
//   return children;
// }


import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import UpsellModal from "./UpsellModal";

export default function RequirePremium({ children }) {
  const auth = useAuth();

  const cur = auth.getCurrent ? auth.getCurrent() : { user: auth.user, org: auth.org };
  const org = cur?.org || null;

  const now = Date.now();
  const sub = (org && org.subscription) ? org.subscription : { tier: "free", expiresAt: 0 };
  const isPremium = sub.tier === "premium" && Number(sub.expiresAt || 0) > now;

  const [showUpsell, setShowUpsell] = useState(false);

  useEffect(() => {
    setShowUpsell(!isPremium);
  }, [isPremium]);

  if (!org) return <Navigate to="/" replace />;

  return (
    <>
      {children}
      <UpsellModal
        open={showUpsell}
        onClose={() => setShowUpsell(false)}
        onUpgrade={async ({ period } = {}) => {
          try {
            if (auth && typeof auth.upgrade === "function") {
              const months = period === "yearly" ? 12 : 1;
              auth.upgrade({ months, tier: "premium" });
            }

            const start = Date.now();
            const timeout = 3000;
            let confirmed = false;
            while (Date.now() - start < timeout) {
              const latest = auth.getCurrent ? auth.getCurrent() : { org: auth.org };
              const latestSub = latest?.org?.subscription;
              if (latestSub && latestSub.tier === "premium" && Number(latestSub.expiresAt || 0) > Date.now()) {
                confirmed = true;
                break;
              }
              await new Promise((r) => setTimeout(r, 120));
            }

            if (!confirmed) {
              console.warn("RequirePremium: upgrade not confirmed within timeout, modal will close.");
            }
          } catch (err) {
            console.error("RequirePremium upgrade error:", err);
          } finally {
            setShowUpsell(false);
          }
        }}
        redirectTo="/ceo"
      />
    </>
  );
}
