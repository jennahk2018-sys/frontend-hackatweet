import Home from "../components/Home";
import { getAvatars } from "../lib/getAvatars";

function Index() {
  return <Home />;
}

// Lit le dossier public/avatar côté serveur (voir pages/index.js pour le détail)
export function getStaticProps() {
  return { props: { avatars: getAvatars() } };
}

export default Index;
