'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { Loader2, Trash2, Edit } from 'lucide-react';

interface CharityData {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  website_url: string | null;
  minimum_allocation: number;
  total_allocated: number | null;
  created_at: string;
}

export default function CharitiesPage() {
  const [charities, setCharities] = useState<CharityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website_url: '',
    image_url: '',
  });

  useEffect(() => {
    fetchCharities();
  }, []);

  const fetchCharities = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('charities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCharities(data || []);
    } catch (err) {
      console.error('[v0] Error fetching charities:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCharity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsAdding(true);
      const { error } = await supabase.from('charities').insert({
        name: formData.name,
        description: formData.description || null,
        website_url: formData.website_url || null,
        image_url: formData.image_url || null,
        minimum_allocation: 10,
      });

      if (error) throw error;

      setFormData({
        name: '',
        description: '',
        website_url: '',
        image_url: '',
      });
      fetchCharities();
    } catch (err) {
      console.error('[v0] Error adding charity:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const deleteCharity = async (charityId: string) => {
    if (!confirm('Are you sure you want to delete this charity?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('charities')
        .delete()
        .eq('id', charityId);

      if (error) throw error;
      setCharities(charities.filter((c) => c.id !== charityId));
    } catch (err) {
      console.error('[v0] Error deleting charity:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Charities Management</h1>
        <p className="mt-2 text-muted-foreground">
          Add and manage partner charities
        </p>
      </div>

      {/* Add Charity Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Charity</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddCharity} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-foreground">Charity Name</label>
                <Input
                  placeholder="Charity name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Website URL</label>
                <Input
                  placeholder="https://example.com"
                  value={formData.website_url}
                  onChange={(e) =>
                    setFormData({ ...formData, website_url: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Description</label>
              <textarea
                placeholder="Charity description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Image URL</label>
              <Input
                placeholder="https://example.com/image.jpg"
                value={formData.image_url}
                onChange={(e) =>
                  setFormData({ ...formData, image_url: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <Button type="submit" disabled={isAdding || !formData.name}>
              {isAdding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Charity'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Charities List */}
      <Card>
        <CardHeader>
          <CardTitle>All Charities ({charities.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : charities.length === 0 ? (
            <p className="py-10 text-center text-muted-foreground">
              No charities added yet
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {charities.map((charity) => (
                <Card key={charity.id} className="border">
                  <CardContent className="pt-6">
                    {charity.image_url && (
                      <img
                        src={charity.image_url}
                        alt={charity.name}
                        className="mb-4 h-40 w-full rounded-lg object-cover"
                      />
                    )}
                    <h3 className="font-semibold text-foreground mb-2">
                      {charity.name}
                    </h3>
                    {charity.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {charity.description}
                      </p>
                    )}
                    {charity.website_url && (
                      <a
                        href={charity.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline mb-4 block"
                      >
                        Visit website →
                      </a>
                    )}
                    <div className="flex gap-2 pt-4 border-t border-border">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteCharity(charity.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
