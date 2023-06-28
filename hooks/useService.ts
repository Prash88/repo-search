import { useState, useEffect, useCallback } from "react";

export const useService = <T>(
  service: () => Promise<T>
): {
  loading: boolean;
  data: T | null;
  error: Error | null;
  refetch: () => void;
  updateOptimistically: (newData: T) => void;
} => {
  const [data, setData] = useState<T | null>(null);
  const [optimisticData, setOptimisticData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const sendRequest = useCallback(() => {
    setLoading(true);
    service()
      .then((response) => {
        console.log({ response });
        setData(response);
        setOptimisticData(null);
        setLoading(false);
      })
      .catch((e) => {
        setError(e);
      });
  }, [service]);

  const refetch = (): void => {
    sendRequest();
  };

  const updateOptimistically = (newData: T): void => {
    setOptimisticData(newData);
  };

  useEffect(() => {
    sendRequest();
  }, [sendRequest]);

  return {
    data: optimisticData || data,
    refetch,
    loading,
    error,
    updateOptimistically,
  };
};