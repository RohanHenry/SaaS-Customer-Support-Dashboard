/**
 * Auth API service layer — every auth-related backend call lives here.
 * Components import these functions instead of calling fetch directly, so the
 * endpoints + payload shapes are defined in exactly one place.
 */
import { apiFetch } from "./api";
import type { User } from "./types";

interface AuthResponse {
  user: User;
}

export function loginRequest(email: string, password: string) {
  return apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function registerRequest(name: string, email: string, password: string) {
  return apiFetch<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export function logoutRequest() {
  return apiFetch<{ message: string }>("/api/auth/logout", { method: "POST" });
}

export function getMeRequest() {
  return apiFetch<AuthResponse>("/api/auth/me");
}
