import { apiRequest } from "./api";

export async function registerUser(name: string, email: string, password: string) {
  const data = await apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });

  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));

  return data;
}

export async function loginUser(email: string, password: string) {
  const data = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));

  return data;
}

export function logoutUser() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
}

export function getToken() {
  return localStorage.getItem("token");
}

export function getUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}