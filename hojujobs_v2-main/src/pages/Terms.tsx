import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          홈으로
        </Link>

        <h1 className="text-2xl font-bold">Terms of Service</h1>
        <p className="text-sm text-muted-foreground">Last updated: April 12, 2026</p>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">1. Acceptance of Terms</h2>
          <p className="text-sm text-muted-foreground">By using Hoju Jobs, you agree to these Terms of Service. If you do not agree, please do not use the site.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">2. Use of the Service</h2>
          <p className="text-sm text-muted-foreground">Hoju Jobs is a job board connecting Korean-speaking job seekers and employers in Australia. You may use this service to post and browse job listings.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">3. User Responsibilities</h2>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li>You must provide accurate information in your job listings</li>
            <li>You must not post fraudulent, misleading, or illegal job listings</li>
            <li>You are responsible for any content you post on the platform</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">4. Account Termination</h2>
          <p className="text-sm text-muted-foreground">We reserve the right to suspend or terminate accounts that violate these terms or post inappropriate content.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">5. Disclaimer</h2>
          <p className="text-sm text-muted-foreground">Hoju Jobs is provided "as is". We do not guarantee the accuracy of job listings and are not responsible for any employment decisions made based on listings found on this site.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">6. Contact</h2>
          <p className="text-sm text-muted-foreground">For any questions regarding these terms, contact us at admin.hojujobs@gmail.com.</p>
        </section>
      </div>
    </div>
  );
}
