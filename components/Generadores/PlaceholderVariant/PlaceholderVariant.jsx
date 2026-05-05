import styles from './PlaceholderVariant.module.css';

export default function PlaceholderVariant({ title }) {
  return (
    <div className={styles.placeholder}>
      <h3>{title}</h3>
    </div>
  );
}
