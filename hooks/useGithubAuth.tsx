import React, { useState, useContext, createContext } from "react";

type GithubAuth = {
  token: string | null;
  setToken: (token: string) => void;
};

const GithubAuthContext = createContext<GithubAuth>({
  token: null,
  setToken: () => {},
});

export const GithubAuthProvider = ({ children }: { children: JSX.Element }) => {
  const [token, setToken] = useState<string | null>(null);
  return (
    <GithubAuthContext.Provider value={{ token, setToken }}>
      {children}
    </GithubAuthContext.Provider>
  );
};

export const useGithubAuth = (): GithubAuth => {
  return useContext(GithubAuthContext);
};