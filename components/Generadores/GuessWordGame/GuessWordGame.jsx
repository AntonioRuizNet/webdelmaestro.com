import { useMemo, useState } from 'react';
import styles from './GuessWordGame.module.css';

const WORDS = {
  facil: ['sol', 'pan', 'luz', 'mar', 'oso'],
  medio: ['colegio', 'planeta', 'camino', 'cuento', 'jardin'],
  dificil: ['biblioteca', 'mariposa', 'ordenador', 'calendario', 'primavera'],
};

function pickWord(level, seed) {
  const words = WORDS[level] || WORDS.facil;
  return words[seed % words.length];
}

export default function GuessWordGame({ variantSlug }) {
  const [seed, setSeed] = useState(0);
  const [guess, setGuess] = useState('');
  const word = useMemo(() => pickWord(variantSlug, seed), [variantSlug, seed]);
  const normalizedGuess = guess.trim().toLowerCase();
  const isCorrect = normalizedGuess === word;

  return (
    <section className={styles.wrapper}>
      <h3>Adivina la palabra</h3>
      <p className={styles.clue}>Tiene {word.length} letras y empieza por “{word[0]}”.</p>
      <div className={styles.mask}>{word.split('').map((letter, index) => <span key={index}>{isCorrect ? letter : index === 0 ? letter : '_'}</span>)}</div>
      <label className={styles.field}>
        <span>Tu respuesta</span>
        <input value={guess} onChange={(event) => setGuess(event.target.value)} />
      </label>
      {guess ? <p className={isCorrect ? styles.correct : styles.wrong}>{isCorrect ? '¡Correcto!' : 'Prueba otra vez.'}</p> : null}
      <button className={styles.button} type="button" onClick={() => { setGuess(''); setSeed((current) => current + 1); }}>
        Nueva palabra
      </button>
    </section>
  );
}
