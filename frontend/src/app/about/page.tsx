import Link from "next/link";
import { ArrowLeft, Globe, Users, Mic, Trophy, Heart, Shield } from "lucide-react";
import "@/scss/Legal.scss";

export const metadata = {
  title: "About Us - AccentGuessr",
  description: "Learn about AccentGuessr - the interactive game where you test your ability to identify English accents from around the world.",
};

export default function About() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <Link href="/" className="legal-back-link">
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        <div className="about-hero">
          <h1 className="legal-title">About AccentGuessr</h1>
          <p className="about-tagline">Discover the world through the sound of voices</p>
        </div>

        <section className="legal-section">
          <h2 className="legal-section-title">Our Mission</h2>
          <p className="legal-text">
            AccentGuessr is an interactive educational game designed to help people explore and appreciate the rich diversity of English accents from around the world. Our mission is to celebrate linguistic diversity, promote cultural awareness, and make learning about different accents fun and engaging.
          </p>
          <p className="legal-text">
            Just like GeoGuessr challenges players to identify locations from visual clues, AccentGuessr challenges you to identify where a speaker is from based solely on how they speak English. It&apos;s a unique way to train your ear and learn about the fascinating world of accents.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">What We Offer</h2>
          <div className="about-features">
            <div className="about-feature">
              <Globe size={32} className="feature-icon" />
              <h3 className="feature-title">Global Accents</h3>
              <p className="feature-desc">Explore English accents from countries and regions worldwide</p>
            </div>
            <div className="about-feature">
              <Users size={32} className="feature-icon" />
              <h3 className="feature-title">Multiplayer Mode</h3>
              <p className="feature-desc">Compete with friends in real-time accent guessing battles</p>
            </div>
            <div className="about-feature">
              <Mic size={32} className="feature-icon" />
              <h3 className="feature-title">Volunteer Program</h3>
              <p className="feature-desc">Contribute your own voice to help grow our accent database</p>
            </div>
            <div className="about-feature">
              <Trophy size={32} className="feature-icon" />
              <h3 className="feature-title">Track Progress</h3>
              <p className="feature-desc">Monitor your scores and improve your accent recognition skills</p>
            </div>
          </div>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">How It Works</h2>
          <p className="legal-text">
            Playing AccentGuessr is simple and intuitive:
          </p>
          <ul className="legal-list">
            <li><strong>Listen:</strong> Hear an audio clip of someone speaking English</li>
            <li><strong>Guess:</strong> Select the country or region where you think the speaker is from</li>
            <li><strong>Learn:</strong> Discover how close your guess was and learn about different accents</li>
            <li><strong>Compete:</strong> Challenge yourself in singleplayer or compete against friends in multiplayer</li>
          </ul>
          <p className="legal-text">
            The more you play, the better you&apos;ll become at distinguishing subtle differences between accents. It&apos;s an entertaining way to develop a global ear!
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">Community-Powered</h2>
          <p className="legal-text">
            AccentGuessr is built with the help of our amazing community of volunteers from around the world. People from different countries contribute their voice recordings, making our accent database diverse and authentic.
          </p>
          <p className="legal-text">
            If you&apos;d like to contribute your accent to help others learn, you can easily submit a recording through our{" "}
            <Link href="/volunteer" className="legal-link">Volunteer page</Link>. Every contribution helps make the game more educational and representative of global English speakers.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">Our Values</h2>
          <div className="about-features">
            <div className="about-feature">
              <Heart size={32} className="feature-icon" />
              <h3 className="feature-title">Inclusivity</h3>
              <p className="feature-desc">We celebrate all accents as equally valid forms of English</p>
            </div>
            <div className="about-feature">
              <Shield size={32} className="feature-icon" />
              <h3 className="feature-title">Privacy</h3>
              <p className="feature-desc">We respect your privacy and protect your personal data</p>
            </div>
          </div>
          <p className="legal-text" style={{ marginTop: "1.5rem" }}>
            We believe every accent tells a story and reflects a unique cultural heritage. AccentGuessr is designed to foster appreciation—not judgment—of linguistic diversity.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">Free to Play</h2>
          <p className="legal-text">
            AccentGuessr is completely free to play. We believe in making education and entertainment accessible to everyone. You can enjoy unlimited games in both singleplayer and multiplayer modes without any cost.
          </p>
          <p className="legal-text">
            Our website is supported by advertisements, which help us maintain and improve the service while keeping it free for all users.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">Get in Touch</h2>
          <p className="legal-text">
            We love hearing from our users! Whether you have feedback, suggestions, questions, or just want to say hello, feel free to reach out:
          </p>
          <p className="legal-text">
            <strong>Email:</strong>{" "}
            <a href="mailto:zhiyuan.liu@tuni.fi" className="legal-email">zhiyuan.liu@tuni.fi</a>
          </p>
          <p className="legal-text">
            You can also support the development of AccentGuessr by{" "}
            <a href="https://buymeacoffee.com/zhiyuanliu" target="_blank" rel="noopener noreferrer" className="legal-link">
              buying us a coffee
            </a>!
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">Legal</h2>
          <p className="legal-text">
            For more information about how we handle your data and the terms of using our service, please review our:
          </p>
          <ul className="legal-list">
            <li><Link href="/privacy" className="legal-link">Privacy Policy</Link></li>
            <li><Link href="/terms" className="legal-link">Terms of Service</Link></li>
            <li><Link href="/contact" className="legal-link">Contact Page</Link></li>
          </ul>
        </section>
      </div>
    </div>
  );
}
