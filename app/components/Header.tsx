import styles from '../styles/Header.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      <h1>AssignMate</h1>
      <nav>
        <a href="#">Your Teams</a>
        <a href="#">Your Projects</a>
        <a href="#">Your Deadlines</a>
      </nav>
      <input type="search" placeholder="Search" />
    </header>
  )
}