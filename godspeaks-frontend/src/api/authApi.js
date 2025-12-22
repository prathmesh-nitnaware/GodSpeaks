/**
 * GodSpeaks Authentication API
 * Configured for Production (Render) and Local Development
 */

// --- DYNAMIC API URL ---
// Netlify will use REACT_APP_API_URL if set; otherwise, it defaults to localhost
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://godspeaks.onrender.com'; 
const API_URL = `${API_BASE_URL}/api/auth`; //

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
    console.error("Login API Error:", error); // Added for easier debugging
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
    console.error("Registration API Error:", error);
    throw error;
  }
};