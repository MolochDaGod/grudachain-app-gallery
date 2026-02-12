import { useState, useEffect, useCallback } from "react";

declare global {
  interface Window {
    puter: any;
  }
}

export function usePuter() {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const check = () => {
      if (window.puter) {
        setReady(true);
        try {
          const isIn = window.puter.auth.isSignedIn();
          setSignedIn(isIn);
          if (isIn) {
            window.puter.auth.getUser().then((u: any) => {
              setUsername(u?.username || null);
            }).catch(() => {});
          }
        } catch {
          setSignedIn(false);
        }
      }
    };
    check();
    const interval = setInterval(check, 500);
    return () => clearInterval(interval);
  }, []);

  const signIn = useCallback(async () => {
    if (!window.puter) return;
    try {
      await window.puter.auth.signIn();
      setSignedIn(true);
      const u = await window.puter.auth.getUser();
      setUsername(u?.username || null);
    } catch (e) {
      console.error("Sign in failed:", e);
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!window.puter) return;
    try {
      await window.puter.auth.signOut();
      setSignedIn(false);
      setUsername(null);
    } catch (e) {
      console.error("Sign out failed:", e);
    }
  }, []);

  return { ready, signedIn, username, signIn, signOut, puter: window.puter };
}
