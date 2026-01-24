
import { useState, useEffect } from 'react';
import { Enquiry, EnquiryStatus } from '../types';
import { ENQUIRIES_STORAGE_KEY } from '../constants';
import { getSupabaseAnonClient } from '../services/supabase';
import { useToast } from './useToast';

export const useEnquiries = () => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const supabaseAnon = getSupabaseAnonClient();
  const { pushToast } = useToast();

  useEffect(() => {
    // Load from Supabase if configured; otherwise fallback to localStorage
    const load = async () => {
      if (supabaseAnon) {
        const { data, error } = await supabaseAnon
          .from('enquiries')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          const mapped: Enquiry[] = data.map((row: any) => ({
            id: row.id,
            service: row.service,
            category: row.category,
            landCondition: row.land_condition ?? undefined,
            phone: row.phone,
            name: row.name ?? undefined,
            address: row.address ?? undefined,
            preferredDate: row.preferred_date ?? undefined,
            preferredTime: row.preferred_time ?? undefined,
            notes: row.notes ?? undefined,
            createdAt: row.created_at,
            status: row.status as EnquiryStatus,
          }));
          setEnquiries(mapped);
          return;
        }
      }
      const stored = localStorage.getItem(ENQUIRIES_STORAGE_KEY);
      if (stored) {
        setEnquiries(JSON.parse(stored));
      }
    };
    load();
  }, []);

  const saveEnquiry = async (
    enquiry: Omit<Enquiry, 'id' | 'createdAt' | 'status'>
  ): Promise<{ entry: Enquiry | null; synced: boolean }> => {
    if (!supabaseAnon) {
      console.error('[Enquiries] Supabase client unavailable; cannot insert.');
      pushToast('Submit failed. Please try again.', 'error');
      return { entry: null, synced: false };
    }
    console.log('[Enquiries] Using dedicated public Supabase client for insert.');
    const phoneDigits = (enquiry.phone || '').replace(/\D+/g, '');
    const payload = {
      service: (enquiry.service || '').trim(),
      category: (enquiry.category || '').toString().trim(),
      land_condition: enquiry.landCondition ? enquiry.landCondition.trim() : null,
      phone: phoneDigits,
      name: enquiry.name ? enquiry.name.trim() : null,
      address: enquiry.address ? enquiry.address.trim() : null,
      preferred_date: enquiry.preferredDate ? enquiry.preferredDate.trim() : null,
      preferred_time: enquiry.preferredTime ? enquiry.preferredTime.trim() : null,
      notes: enquiry.notes ? enquiry.notes.trim() : null,
      status: EnquiryStatus.NEW,
    };

    const { data, error } = await supabaseAnon
      .from('enquiries')
      .insert(payload);

    console.log('[Enquiries] Supabase insert response:', { data, error });

    if (error) {
      console.error('[Enquiries] Supabase insert error:', error);
      pushToast(`Insert failed: ${error?.message || 'Unknown error'}`, 'error');
      return { entry: null, synced: false };
    }
    // Insert succeeded; we may not have row data due to select RLS. Optimistically prepend minimal entry.
    const nowIso = new Date().toISOString();
    const newEnquiry: Enquiry = {
      id: Math.random().toString(36).slice(2),
      service: enquiry.service,
      category: enquiry.category,
      landCondition: enquiry.landCondition ?? undefined,
      phone: phoneDigits,
      name: enquiry.name ?? undefined,
      address: enquiry.address ?? undefined,
      preferredDate: enquiry.preferredDate ?? undefined,
      preferredTime: enquiry.preferredTime ?? undefined,
      notes: enquiry.notes ?? undefined,
      createdAt: nowIso,
      status: EnquiryStatus.NEW,
    };
    const updated = [newEnquiry, ...enquiries];
    setEnquiries(updated);
    pushToast('Request received. Admin notified.', 'success');
    return { entry: newEnquiry, synced: true };
  };

  const updateEnquiryStatus = (id: string, status: EnquiryStatus) => {
    const updated = enquiries.map(e => e.id === id ? { ...e, status } : e);
    setEnquiries(updated);
    localStorage.setItem(ENQUIRIES_STORAGE_KEY, JSON.stringify(updated));
    // Server-side status updates handled in AdminDashboard via authenticated client
  };

  const deleteEnquiry = (id: string) => {
    const updated = enquiries.filter(e => e.id !== id);
    setEnquiries(updated);
    localStorage.setItem(ENQUIRIES_STORAGE_KEY, JSON.stringify(updated));
    // Server-side deletes handled in AdminDashboard via authenticated client
  };

  return { enquiries, saveEnquiry, updateEnquiryStatus, deleteEnquiry };
};
