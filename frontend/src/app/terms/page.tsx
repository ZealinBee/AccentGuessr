import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import "@/scss/Legal.scss";

export const metadata = {
  title: "Terms of Service - AccentGuessr",
  description: "Terms of Service for AccentGuessr - Rules and conditions for using the service.",
};

export default function TermsOfService() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <Link href="/" className="legal-back-link">
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        <h1 className="legal-title">Terms of Service</h1>
        <p className="legal-updated">Last updated: December 20, 2025</p>

        <section className="legal-section">
          <h2 className="legal-section-title">Acceptance of Terms</h2>
          <p className="legal-text">
            By accessing or using AccentGuessr ("the Service"), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use the Service.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">Use of the Service</h2>
          <p className="legal-text">
            The Service is provided for educational and entertainment purposes. You agree to use the Service only for lawful purposes and in a manner consistent with all applicable laws and regulations.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">User Accounts</h2>
          <p className="legal-text">
            Some features require an account. You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">Volunteer Contributions</h2>
          <p className="legal-text">
            By submitting audio recordings or other contributions, you grant AccentGuessr a perpetual, worldwide, royalty-free license to use, reproduce, modify, and distribute your contributions for the purposes of operating and improving the Service.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">Prohibited Conduct</h2>
          <p className="legal-text">
            You must not use the Service to upload or distribute content that is unlawful, harmful, abusive, defamatory, or infringes third-party rights.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">Disclaimer and Limitation of Liability</h2>
          <p className="legal-text">
            The Service is provided "as is" without warranties of any kind. To the fullest extent permitted by law, AccentGuessr will not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">Changes to Terms</h2>
          <p className="legal-text">
            We may modify these Terms at any time. We will post the updated Terms on this page and update the "Last updated" date. Continued use of the Service after changes indicates your acceptance of the new Terms.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-section-title">Contact Us</h2>
          <p className="legal-text">
            If you have questions about these Terms, please contact us at <a href="mailto:zhiyuan.liu@tuni.fi" className="legal-email">zhiyuan.liu@tuni.fi</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
