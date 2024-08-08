import styles from '../styles/TeamCard.module.css'

interface TeamCardProps {
  name: string;
  color: string;
}

export default function TeamCard({ name, color }: TeamCardProps) {
  return (
    <div className={styles.card} style={{ backgroundColor: color }}>
      {name}
    </div>
  )
}