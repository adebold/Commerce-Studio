import React from "react";
import { Link } from "react-router-dom";

/**
 * LandingPage - Public-facing entry for the Eyewear ML SaaS platform.
 * Uses the new design system: utility classes, tokens, and premium branding.
 */
const features = [
  {
    title: "Centralized Eyewear Repository",
    description: "Upload, manage, and showcase your eyewear products for free. Join the industry’s largest, AI-powered eyewear database.",
    icon: "🕶️",
  },
  {
    title: "ML Tools & Analytics",
    description: "Unlock face shape analysis, style matching, virtual try-on, and advanced analytics. Upgrade for full access.",
    icon: "🤖",
  },
  {
    title: "Agentic Onboarding",
    description: "Guided, step-by-step onboarding for manufacturers and retailers. Get started in minutes.",
    icon: "🚀",
  },
  {
    title: "Live Demo Store",
    description: "Experience the platform in action. Try the HTML store integration and see ML features live.",
    icon: "🛒",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-primary mb-4">
          Eyewear ML Platform
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground mb-8">
          The premium SaaS platform for the global eyewear industry. Centralize your products, unlock AI-powered tools, and grow your business with agentic onboarding and analytics.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register" className="apple-button-primary px-8 py-3 text-lg">
            Get Started Free
          </Link>
          <Link to="/demo" className="apple-button-secondary px-8 py-3 text-lg">
            View Live Demo
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-card">
        <div className="container-md">
          <h2 className="text-3xl font-bold text-center mb-10">Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="apple-card flex flex-col items-center p-8 text-center"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 flex flex-col items-center bg-gradient-to-t from-primary/5 to-transparent">
        <h3 className="text-2xl font-bold mb-4">Ready to join the future of eyewear?</h3>
        <Link to="/register" className="apple-button-primary px-8 py-3 text-lg">
          Create Your Free Account
        </Link>
        <p className="mt-4 text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="underline text-primary">Sign in</Link>
        </p>
      </section>
    </main>
  );
}