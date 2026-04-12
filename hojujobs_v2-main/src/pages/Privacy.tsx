import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          홈으로
        </Link>

        <h1 className="text-2xl font-bold">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: April 12, 2026</p>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">1. Information We Collect</h2>
          <p className="text-sm text-muted-foreground">When you sign in with Google, we collect your name, email address, and profile picture provided by Google. We use this information solely to create and manage your account on Hoju Jobs.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">2. How We Use Your Information</h2>
          <p className="text-sm text-muted-foreground">We use your information to:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li>Create and manage your account</li>
            <li>Allow you to post and manage job listings</li>
            <li>Contact you regarding your account or listings</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">3. Data Storage</h2>
          <p className="text-sm text-muted-foreground">Your data is stored securely using Supabase. We do not sell or share your personal information with third parties.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">4. Cookies</h2>
          <p className="text-sm text-muted-foreground">We use session cookies to keep you logged in. No tracking or advertising cookies are used.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">5. Your Rights</h2>
          <p className="text-sm text-muted-foreground">You may request deletion of your account and associated data at any time by contacting us at admin.hojujobs@gmail.com.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">6. Contact</h2>
          <p className="text-sm text-muted-foreground">For any privacy-related questions, contact us at admin.hojujobs@gmail.com.</p>
        </section>
      </div>
    </div>
  );
}

