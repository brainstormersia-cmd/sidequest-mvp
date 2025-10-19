export type Application = {
  id: string;
  mission_id: string;
  applicant_device_id: string | null;
  applicant_name?: string | null;
  applicant_contact?: string | null;
  note?: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  created_at?: string;
};

export type ApplicationInput = {
  mission_id: string;
  applicant_device_id: string;
  applicant_name?: string;
  applicant_contact?: string;
  note?: string;
};
