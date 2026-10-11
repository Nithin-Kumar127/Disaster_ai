import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Trophy, Users, TrendingUp } from 'lucide-react';

export const metadata = {
  title: 'Golf Charity Subscription - Make an Impact While You Play',
  description: 'Join our community of golfers making a difference. Monthly prize draws, Stableford scoring, and guaranteed charitable contributions.',
};

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-primary">Golf Charity</div>
          <div className="flex gap-4">
            <Link href="/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-primary hover:bg-primary/90">Join Now</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-6 text-balance leading-tight">
              Your Golf Game Makes an Impact
            </h1>
            <p className="text-xl text-muted-foreground mb-8 text-pretty">
              Subscribe to our platform, record your Stableford scores, and compete in monthly draws. Every subscription fee contributes directly to your chosen charity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <Button size="lg" className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                  Get Started
                </Button>
              </Link>
              <Link href="#charities">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Explore Charities
                </Button>
              </Link>
            </div>
          </div>
          <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-12 flex items-center justify-center min-h-96">
            <div className="text-center">
              <Trophy className="w-24 h-24 text-primary mx-auto mb-4" />
              <p className="text-xl font-semibold text-foreground">Monthly Prize Draws</p>
              <p className="text-sm text-muted-foreground mt-2">Win real prizes. Support real causes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary/5 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">$0</div>
              <p className="text-muted-foreground">Raised for Charities</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">0</div>
              <p className="text-muted-foreground">Active Members</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">5</div>
              <p className="text-muted-foreground">Partner Charities</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-center mb-16 text-foreground">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: Users,
              title: 'Choose a Charity',
              description: 'Select from our partner charities. We contribute 10% minimum of your subscription.',
            },
            {
              icon: TrendingUp,
              title: 'Record Scores',
              description: 'Enter your latest 5 Stableford scores. We automatically manage your scoring history.',
            },
            {
              icon: Trophy,
              title: 'Monthly Draws',
              description: 'Your scores enter you into draws with prizes at 3, 4, and 5-number matching tiers.',
            },
            {
              icon: Heart,
              title: 'Make an Impact',
              description: 'Every subscription directly supports your chosen charity. Track your contribution in real-time.',
            },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <Card key={index} className="border-border/50 hover:shadow-md transition-shadow">
                <CardHeader>
                  <Icon className="w-10 h-10 text-primary mb-4" />
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Charities Section */}
      <section id="charities" className="bg-secondary/30 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-4 text-foreground">Our Partner Charities</h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl">
            We partner with meaningful organizations making real impact. Your subscription ensures these charities receive direct support.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { name: 'The First Tee', description: 'Golf education for youth' },
              { name: 'PGA Foundation', description: 'Community golf access' },
              { name: 'Genesis Foundation', description: 'Cancer research funding' },
              { name: 'St. Jude Hospital', description: 'Childhood cancer care' },
              { name: 'Golf Foundation', description: 'Junior golf development' },
            ].map((charity, index) => (
              <Card key={index} className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-base">{charity.name}</CardTitle>
                  <CardDescription className="text-xs">{charity.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Subscription Plans Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-center mb-4 text-foreground">Simple Pricing</h2>
        <p className="text-center text-lg text-muted-foreground mb-12">
          Choose your plan and start making an impact today.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-border/50 relative">
            <CardHeader>
              <CardTitle>Monthly</CardTitle>
              <CardDescription>Perfect for trying us out</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <span className="text-4xl font-bold text-primary">$29</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Unlimited score entries
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Monthly prize draws
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Charity tracking
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  10% to charity
                </li>
              </ul>
              <Link href="/signup?plan=monthly" className="w-full">
                <Button variant="outline" className="w-full">
                  Subscribe Monthly
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-primary/50 bg-primary/5 relative">
            <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-semibold">
              Save 20%
            </div>
            <CardHeader>
              <CardTitle>Yearly</CardTitle>
              <CardDescription>Best value for committed golfers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <span className="text-4xl font-bold text-primary">$299</span>
                <span className="text-muted-foreground">/year</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Unlimited score entries
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Monthly prize draws
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Charity tracking
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  10% to charity
                </li>
              </ul>
              <Link href="/signup?plan=yearly" className="w-full">
                <Button className="w-full bg-primary hover:bg-primary/90">
                  Subscribe Yearly
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/10 py-16">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Ready to Make an Impact?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of golfers supporting meaningful causes through their passion for the game.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Start Your Journey
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-secondary/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4 text-foreground">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">Features</Link></li>
                <li><Link href="#" className="hover:text-primary">Pricing</Link></li>
                <li><Link href="#" className="hover:text-primary">Security</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-foreground">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">About</Link></li>
                <li><Link href="#" className="hover:text-primary">Blog</Link></li>
                <li><Link href="#" className="hover:text-primary">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-foreground">Charity</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">Our Partners</Link></li>
                <li><Link href="#" className="hover:text-primary">Impact</Link></li>
                <li><Link href="#" className="hover:text-primary">How It Works</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-foreground">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">Privacy</Link></li>
                <li><Link href="#" className="hover:text-primary">Terms</Link></li>
                <li><Link href="#" className="hover:text-primary">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/40 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2026 Golf Charity Subscription. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
