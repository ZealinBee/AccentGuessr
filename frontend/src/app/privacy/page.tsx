import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import "@/scss/Legal.scss";

export const metadata = {
  title: "Privacy Policy - AccentGuessr",
  description: "Privacy Policy for AccentGuessr - Learn how we collect, use, and protect your personal information.",
};

export default function PrivacyPolicy() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <Link href="/" className="legal-back-link">
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        <h1 className="legal-title">Privacy Policy</h1>
        <p className="legal-updated">Last updated: December 20, 2025</p>

        <section className="legal-section">
          <h2 className="legal-section-title">Introduction</h2>
          <p className="legal-text">
            Welcome to AccentGuessr (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website at guesstheaccent.xyz and use our accent guessing game services.
          </p>
          <p className="legal-text">
            By using AccentGuessr, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">Information We Collect</h2>
          <p className="legal-text">We collect several types of information from and about users of our website:</p>

          <h3 className="legal-section-title" style={{ fontSize: "1.1rem", marginTop: "1rem" }}>Personal Information</h3>
          <ul className="legal-list">
            <li><strong>Google Account Information:</strong> When you sign in with Google, we receive your name, email address, and profile picture from your Google account.</li>
            <li><strong>Voice Recordings:</strong> If you volunteer to contribute accent recordings, we collect and store the audio recordings you submit.</li>
            <li><strong>Game Data:</strong> We collect information about your gameplay, including scores, game history, and performance statistics.</li>
          </ul>

          <h3 className="legal-section-title" style={{ fontSize: "1.1rem", marginTop: "1rem" }}>Automatically Collected Information</h3>
          <ul className="legal-list">
            <li><strong>Usage Data:</strong> We collect information about how you interact with our website, including pages visited, time spent on pages, and actions taken.</li>
            <li><strong>Device Information:</strong> We may collect information about your device, including browser type, operating system, and screen resolution.</li>
            <li><strong>Cookies and Similar Technologies:</strong> We use cookies and similar tracking technologies to enhance your experience and gather analytics data.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">How We Use Your Information</h2>
          <p className="legal-text">We use the information we collect for the following purposes:</p>
          <ul className="legal-list">
            <li>To provide, operate, and maintain our accent guessing game</li>
            <li>To authenticate users and manage user accounts</li>
            <li>To track game progress, scores, and statistics</li>
            <li>To improve and personalize user experience</li>
            <li>To analyze usage patterns and optimize our services</li>
            <li>To communicate with you about updates or respond to inquiries</li>
            <li>To detect and prevent fraud or abuse</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">Third-Party Services</h2>
          <p className="legal-text">We use the following third-party services that may collect information about you:</p>
          <ul className="legal-list">
            <li><strong>Google Sign-In:</strong> For user authentication. Google&apos;s privacy policy applies to data processed by Google.</li>
            <li><strong>Google Analytics / Firebase Analytics:</strong> To analyze website traffic and user behavior. This service may collect anonymized usage data.</li>
            <li><strong>Google AdSense:</strong> To display advertisements. AdSense may use cookies to serve personalized ads based on your interests.</li>
            <li><strong>Azure Blob Storage:</strong> To securely store audio recordings submitted by volunteers.</li>
          </ul>
          <p className="legal-text">
            These third-party services have their own privacy policies. We encourage you to review their policies to understand how they handle your data.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">Cookies and Advertising</h2>
          <p className="legal-text">
            We use cookies to enhance your browsing experience and to serve relevant advertisements. Cookies are small text files stored on your device that help us recognize you and remember your preferences.
          </p>
          <p className="legal-text">
            <strong>Advertising:</strong> We use Google AdSense to display ads on our website. Google and its partners may use cookies to serve ads based on your prior visits to our website or other websites. You can opt out of personalized advertising by visiting{" "}
            <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="legal-link">
              Google Ads Settings
            </a>.
          </p>
          <p className="legal-text">
            You can control cookies through your browser settings. However, disabling cookies may affect some features of our website.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">Data Security</h2>
          <p className="legal-text">
            We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include encryption, secure servers, and access controls.
          </p>
          <p className="legal-text">
            However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your personal information, we cannot guarantee its absolute security.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">Data Retention</h2>
          <p className="legal-text">
            We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When you delete your account, we will delete or anonymize your personal data, except where we are required to retain it for legal purposes.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">Your Rights</h2>
          <p className="legal-text">Depending on your location, you may have the following rights regarding your personal information:</p>
          <ul className="legal-list">
            <li><strong>Access:</strong> Request access to the personal information we hold about you</li>
            <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
            <li><strong>Deletion:</strong> Request deletion of your personal information</li>
            <li><strong>Data Portability:</strong> Request a copy of your data in a portable format</li>
            <li><strong>Opt-out:</strong> Opt out of certain data processing activities, including marketing communications</li>
          </ul>
          <p className="legal-text">
            To exercise any of these rights, please contact us at{" "}
            <a href="mailto:zhiyuan.liu@tuni.fi" className="legal-email">zhiyuan.liu@tuni.fi</a>.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">Children&apos;s Privacy</h2>
          <p className="legal-text">
            AccentGuessr is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If we discover that a child under 13 has provided us with personal information, we will promptly delete it. If you believe a child under 13 has provided us with personal data, please contact us.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">International Data Transfers</h2>
          <p className="legal-text">
            Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that are different from your country. We take appropriate safeguards to ensure that your personal information remains protected in accordance with this Privacy Policy.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">Changes to This Privacy Policy</h2>
          <p className="legal-text">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. We encourage you to review this Privacy Policy periodically for any changes.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">Contact Us</h2>
          <p className="legal-text">
            If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:
          </p>
          <p className="legal-text">
            <strong>Email:</strong>{" "}
            <a href="mailto:zhiyuan.liu@tuni.fi" className="legal-email">zhiyuan.liu@tuni.fi</a>
          </p>
          <p className="legal-text">
            <strong>Website:</strong>{" "}
            <a href="https://guesstheaccent.xyz" className="legal-link">guesstheaccent.xyz</a>
          </p>
        </section>
      </div>
    </div>
  );
}
