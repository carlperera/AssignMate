import Header from './components/Header'
import Hero from './components/Hero'
import FeatureGrid from './components/FeatureGrid'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Header />
      <Hero />
      <FeatureGrid />
    </main>
  );
}