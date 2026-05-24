import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { VideoSection } from "@/components/video-section"
import { Features } from "@/components/features"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <VideoSection />
      <Features />
      <Footer />
    </main>
  )
}
