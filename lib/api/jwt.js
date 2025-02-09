export const decodeJwt = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    return null;
  }
};

// Check if token is expired
export const isTokenExpired = (token) => {
  const decoded = decodeJwt(token);
  return decoded ? decoded.exp * 1000 < Date.now() : true;
};

// Check and refresh token every 5 seconds
export const checkTokenExpiry = async () => {
  const accessToken = localStorage.getItem("access");
  if (!accessToken || isTokenExpired(accessToken)) {
    console.warn("Token expired. Refreshing...");
    await refreshToken();
  }
};

setInterval(checkTokenExpiry, 5000);
