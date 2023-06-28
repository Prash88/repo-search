
import { GithubAuthProvider } from "./hooks/useGithubAuth";
import HomeScreen from "./screens/HomeScreen";

export default function App() {
  return (
    <GithubAuthProvider>
      <HomeScreen />
    </GithubAuthProvider>
  );
}
