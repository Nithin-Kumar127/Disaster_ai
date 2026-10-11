'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    minCharityPercentage: 10,
    monthlyDrawFee: 29,
    yearlyDrawFee: 299,
    discountPercentage: 14,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      alert('Settings saved successfully!');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Configure platform settings and pricing
        </p>
      </div>

      {/* Subscription Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Pricing</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Monthly Price ($)
                </label>
                <Input
                  type="number"
                  value={settings.monthlyDrawFee}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      monthlyDrawFee: parseFloat(e.target.value),
                    })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  Yearly Price ($)
                </label>
                <Input
                  type="number"
                  value={settings.yearlyDrawFee}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      yearlyDrawFee: parseFloat(e.target.value),
                    })
                  }
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                Yearly Discount (%)
              </label>
              <Input
                type="number"
                value={settings.discountPercentage}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    discountPercentage: parseFloat(e.target.value),
                  })
                }
                className="mt-1"
              />
            </div>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Charity Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Charity Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">
                Minimum Charity Allocation (%)
              </label>
              <Input
                type="number"
                value={settings.minCharityPercentage}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    minCharityPercentage: parseFloat(e.target.value),
                  })
                }
                className="mt-1"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Users must allocate at least this percentage of their subscription fee to charity
              </p>
            </div>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Draw Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Draw Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-border p-4">
              <p className="text-sm text-muted-foreground">5-Number Match</p>
              <p className="mt-2 text-lg font-bold text-primary">40%</p>
              <p className="mt-1 text-xs text-muted-foreground">Of prize pool</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-sm text-muted-foreground">4-Number Match</p>
              <p className="mt-2 text-lg font-bold text-blue-600">35%</p>
              <p className="mt-1 text-xs text-muted-foreground">Of prize pool</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-sm text-muted-foreground">3-Number Match</p>
              <p className="mt-2 text-lg font-bold text-green-600">25%</p>
              <p className="mt-1 text-xs text-muted-foreground">Of prize pool</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            These prize distribution percentages are hardcoded in the draw engine
            and cannot be modified here.
          </p>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">Database Connection</span>
            <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
              Connected
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">Stripe Integration</span>
            <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
              Active
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">Email Service</span>
            <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
              Connected
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">API Health</span>
            <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
              Healthy
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
