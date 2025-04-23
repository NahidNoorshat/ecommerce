import { refreshToken, handleSessionExpiration } from "./auth";

export const secureFetch = async (url, options = {}, dispatch = null) => {
  let access = localStorage.getItem("access");

  const mergedOptions = {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${access}`,
      "Content-Type": options.body ? "application/json" : undefined,
    },
  };

  let response = await fetch(url, mergedOptions);

  // 🔁 Handle expired access token
  if (response.status === 401) {
    const newAccess = await refreshToken();

    if (newAccess) {
      // Retry with new token
      const retryOptions = {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${newAccess}`,
          "Content-Type": options.body ? "application/json" : undefined,
        },
      };
      response = await fetch(url, retryOptions);
    } else {
      // ❌ Refresh also failed — logout
      await handleSessionExpiration(dispatch);
      return null;
    }
  }

  return response;
};
