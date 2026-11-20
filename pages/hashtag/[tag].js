import Hashtag from "../../components/Hashtag";
import { getAvatars } from "../../lib/getAvatars";

function HashtagPage() {
  return <Hashtag />;
}

// Lit le dossier public/avatar côté serveur (voir pages/index.js pour le détail)
export function getStaticProps() {
  return { props: { avatars: getAvatars() } };
}

// Obligatoire pour une page dynamique ([tag]) qui utilise getStaticProps :
// Next.js doit savoir quelles pages préparer à l'avance.
// - paths: [] -> on n'en prépare aucune au build (on ne connaît pas les hashtags)
// - fallback: "blocking" -> chaque /hashtag/xxx est générée à la première visite
export function getStaticPaths() {
  return { paths: [], fallback: "blocking" };
}

export default HashtagPage;
