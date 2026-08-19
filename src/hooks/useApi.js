import { useState } from "react";

const useApi = (baseUrl) => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const request = async (endpoint, options = {}, updatesList = false) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
      });

      if (!response.ok) {
        throw new Error("ошибка потому что ты чушпан");
      }

      const result = await response.json();

      if (updatesList) setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const get = (endpoint) => request(endpoint, { method: "GET" }, true);

  const post = (endpoint, newChushpan) =>
    request(endpoint, { method: "POST", body: JSON.stringify(newChushpan) });

  const put = (endpoint, newChushpan) =>
    request(endpoint, { method: "PUT", body: JSON.stringify(newChushpan) });

  const deleteChushpan = (endpoint) => request(endpoint, { method: "DELETE" });

  return {
    error,
    data,
    loading,
    get,
    post,
    put,
    deleteChushpan,
  };
};

export default useApi;
