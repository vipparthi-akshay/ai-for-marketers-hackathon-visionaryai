export type Registration = {
  teamName: string;
  name: string;
  email: string;
  teamSize: string;
  track: string;
  linkedin: string;
  password: string;
  createdAt: string;
};

const ACCOUNTS_KEY = "hackathon_accounts";
const SESSION_KEY = "hackathon_session";

export function saveRegistration(data: Registration): void {
  const accounts = getAccounts();
  accounts.push(data);
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function getAccounts(): Registration[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function findAccount(email: string): Registration | undefined {
  const normalized = email.trim().toLowerCase();
  return getAccounts().find((a) => a.email.trim().toLowerCase() === normalized);
}

export function setSession(email: string): void {
  localStorage.setItem(SESSION_KEY, email.trim().toLowerCase());
}

export function getSession(): Registration | null {
  if (typeof window === "undefined") return null;
  const email = localStorage.getItem(SESSION_KEY);
  if (!email) return null;
  return findAccount(email) ?? null;
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}
