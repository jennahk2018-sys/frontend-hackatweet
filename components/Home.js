import styles from '../styles/Home.module.css';
import { useState } from 'react';
import { useSelector } from 'react-redux';


function Home() {
  const [newTweet, setNewTweet] = useState('');
  const user = useSelector((state) => state.user.value);

  const handleTweet = () => {
    // Vérif si le tweet est vide
    if (newTweet.trim() === '') {
      return;
    }

    //Envoie le tweet au backend
    fetch('http://localhost:3000/tweets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`,
      },
      body: JSON.stringify({
        content: newTweet,
      }),
    })
      //Conv la réponse en JSON
      .then(response => response.json())

      //Vérif si la publication a réussi
      .then(data => {
        if (data.result === true) {
          setNewTweet('');
          console.log('Tweet publié !');
        } else {
          console.log('Erreur :', data.error);
        }
      })

      //Gére les erreurs
      .catch(error => {
        console.error('Erreur lors de la publication :', error);
      });
  };



  return (
    <div>
      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome sur la page Home
        </h1>

        <textarea
          placeholder="What's up?"
          value={newTweet}
          onChange={(e) => setNewTweet(e.target.value)}
          maxLength={280}
        />

        <p>{newTweet.length}/280</p>

        <button onClick={handleTweet}>
          Tweet
        </button>
      </main>
    </div>
  );
}

export default Home;
