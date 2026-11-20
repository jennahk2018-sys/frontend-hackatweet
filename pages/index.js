import Login from '../components/Login';
import { getAvatars } from '../lib/getAvatars';

function Index() {
  return <Login />;
}

// getStaticProps s'exécute côté SERVEUR (au build, et à chaque requête en dev).
// Il lit le dossier public/avatar et envoie la liste à la page dans ses props.
// _app.js la récupère ensuite pour la partager avec tous les composants.
export function getStaticProps() {
  return { props: { avatars: getAvatars() } };
}

export default Index;
