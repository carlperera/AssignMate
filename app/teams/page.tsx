import TeamCard from '../components/TeamCard'
import styles from '../styles/page.module.css'

export default function Page() {
  const teams = [
    { name: 'FIT3171 Team 2', color: '#ff9999' },
    { name: 'FIT3178 Team 5', color: '#ff99ff' },
    { name: 'FIT3178 Team 5', color: '#ff99ff' }

  ]

  return (
    <div className={styles.grid}>
      {teams.map(team => (
        <TeamCard key={team.name} name={team.name} color={team.color} />
      ))}
    </div>
  )
}