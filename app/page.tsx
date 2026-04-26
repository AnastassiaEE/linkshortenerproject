import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Link2, BarChart3, Shield, Zap, LayoutDashboard, Globe } from 'lucide-react';
import { SignInButtonComponent } from '@/components/sign-in-button';
import { SignUpButtonComponent } from '@/components/sign-up-button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const features = [
  {
    icon: Link2,
    title: 'Shorten Any URL',
    description:
      'Transform long, unwieldy URLs into clean, shareable short links in seconds.',
  },
  {
    icon: BarChart3,
    title: 'Track Performance',
    description:
      'Monitor click counts and engagement for every link you create.',
  },
  {
    icon: LayoutDashboard,
    title: 'Manage with Ease',
    description:
      'View and manage all your shortened links from one central dashboard.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description:
      'Redirects happen in milliseconds so your audience never waits.',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description:
      'Your links are protected and tied to your account — no one else can touch them.',
  },
  {
    icon: Globe,
    title: 'Share Everywhere',
    description:
      'Post your short links on social media, emails, or anywhere on the web.',
  },
];

export default async function HomePage() {
  const { userId } = await auth();

  // Redirect authenticated users to dashboard
  if (userId) {
    redirect('/dashboard');
  }

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="container mx-auto px-4 py-24 text-center space-y-8">
        <h1 className="text-5xl font-bold tracking-tight">
          Shorten, Share &amp; Track
          <br />
          <span className="text-muted-foreground">Your Links</span>
        </h1>
        <p className="max-w-xl mx-auto text-lg text-muted-foreground">
          Turn any long URL into a clean, memorable short link. Track clicks,
          manage your links, and share with confidence — all from one place.
        </p>
        <div className="flex gap-3 justify-center">
          <SignUpButtonComponent />
          <SignInButtonComponent />
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 pb-24">
        <h2 className="text-3xl font-semibold text-center mb-12">
          Everything you need
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, description }) => (
            <Card key={title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="size-5 text-primary" />
                  {title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="leading-relaxed">
                  {description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="border-t">
        <div className="container mx-auto px-4 py-20 text-center space-y-6">
          <h2 className="text-3xl font-semibold">Ready to get started?</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Create your free account and start shortening links today.
          </p>
          <SignUpButtonComponent />
        </div>
      </section>
    </main>
  );
}
