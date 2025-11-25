// UPDATED: Pointing to the new generic auth route
const API_URL = "http://localhost:5000/api/auth";

/**
 * Logs in the user (Admin or Customer).
 */
export const loginApi = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Login failed");
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Registers a new Customer.
 */
export const registerApi = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.errors
        ? data.errors.map((e) => e.msg).join(", ")
        : data.message || "Registration failed";
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    throw error;
  }
};
