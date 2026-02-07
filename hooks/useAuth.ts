import { useEffect, useState } from "react";

export type AuthUser = {
  id: string;
} | null;

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthUser>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setUser(null);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return { loading, user };
}
