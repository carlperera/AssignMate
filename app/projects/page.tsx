import TeamCard from '../components/TeamCard'
import styles from '../styles/page.module.css'

export default function Projects() {
  const teams = [
    { name: 'Project Alpha', color: 'blue' },
    { name: 'Project Beta', color: '#ff99ff' },
    { name: 'Project Gamma', color: 'red' },
    { name: 'Project Delta', color: 'green' }
  ]

  return (
    <div className={styles.grid}>
      {teams.map(team => (
        <TeamCard key={team.name} name={team.name} color={team.color} />
      ))}
    </div>
  )
}