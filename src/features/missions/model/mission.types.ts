export type Mission = {
  id: string;
  owner_device_id: string | null;
  title: string;
  description?: string | null;
  reward?: string | null;
  location?: string | null;
  date?: string | null;
  tags: string[];
  contact_visible?: string | null;
  status: 'open' | 'closed' | 'draft';
  created_at?: string;
};

export type MissionInput = {
  title: string;
  description?: string;
  reward?: string;
  location?: string;
  date?: string;
  tags?: string[];
  contact_visible?: string;
};
