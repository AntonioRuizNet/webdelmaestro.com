import { useMemo, useState } from 'react';
import styles from './InteractiveMultiplicationPractice.module.css';

const MODE_CONFIG = {
  'modo-lento': { title: 'Modo lento', max: 5, questions: 5 },
  'modo-rapido': { title: 'Modo rápido', max: 10, questions: 8 },
  examen: { title: 'Examen', max: 12, questions: 10 },
};

function randomQuestion(max) {
  const a = Math.floor(Math.random() * max) + 1;
  const b = Math.floor(Math.random() * max) + 1;
  return { a, b, answer: a * b };
}

function createQuestions(config) {
  return Array.from({ length: config.questions }, () => randomQuestion(config.max));
}

export default function InteractiveMultiplicationPractice({ variantSlug }) {
  const config = MODE_CONFIG[variantSlug] || MODE_CONFIG['modo-lento'];
  const [seed, setSeed] = useState(1);
  const [answers, setAnswers] = useState({});
  const questions = useMemo(() => createQuestions(config), [config, seed]);

  const score = questions.reduce((total, question, index) => {
    return Number(answers[index]) === question.answer ? total + 1 : total;
  }, 0);

  return (
    <section className={styles.wrapper}>
      <div className={styles.header}>
        <h3>{config.title}</h3>
        <strong>{score}/{questions.length}</strong>
      </div>

      <div className={styles.grid}>
        {questions.map((question, index) => {
          const value = answers[index] || '';
          const isAnswered = value !== '';
          const isCorrect = Number(value) === question.answer;

          return (
            <label key={`${seed}-${index}`} className={styles.card}>
              <span>{question.a} × {question.b} =</span>
              <input
                type="number"
                value={value}
                onChange={(event) => setAnswers((current) => ({ ...current, [index]: event.target.value }))}
              />
              {isAnswered ? (
                <small className={isCorrect ? styles.correct : styles.wrong}>
                  {isCorrect ? 'Correcto' : 'Revisa'}
                </small>
              ) : null}
            </label>
          );
        })}
      </div>

      <button className={styles.button} type="button" onClick={() => { setAnswers({}); setSeed((current) => current + 1); }}>
        Nuevas multiplicaciones
      </button>
    </section>
  );
}
