
import { useState, useEffect } from 'react';
import { Enquiry, EnquiryStatus } from '../types';
import { ENQUIRIES_STORAGE_KEY } from '../constants';
import { getSupabaseClient } from '../services/supabase';
import { useToast } from './useToast';

export const useEnquiries = () => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const supabase = getSupabaseClient();
  const { pushToast } = useToast();

  useEffect(() => {
    // Load from Supabase if configured; otherwise fallback to localStorage
    const load = async () => {
      if (supabase) {
        const { data, error } = await supabase
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
    const createLocal = () => {
      console.error('[Enquiries] Supabase unavailable or insert failed; not saving locally.');
      pushToast('Submit failed. Please try again.', 'error');
      return { entry: null, synced: false };
    };

    if (!supabase) return createLocal();

    const { data, error } = await supabase
      .from('enquiries')
      .insert({
        service: enquiry.service,
        category: enquiry.category,
        land_condition: enquiry.landCondition ?? null,
        phone: enquiry.phone,
        name: enquiry.name ?? null,
        address: enquiry.address ?? null,
        preferred_date: enquiry.preferredDate ?? null,
        preferred_time: enquiry.preferredTime ?? null,
        notes: enquiry.notes ?? null,
        status: EnquiryStatus.NEW,
      })
      .select('*')
      .single();

    if (error || !data) {
      console.error('[Enquiries] Supabase insert error:', error);
      return createLocal();
    }
    const newEnquiry: Enquiry = {
      id: data.id,
      service: data.service,
      category: data.category,
      landCondition: data.land_condition ?? undefined,
      phone: data.phone,
      name: data.name ?? undefined,
      address: data.address ?? undefined,
      preferredDate: data.preferred_date ?? undefined,
      preferredTime: data.preferred_time ?? undefined,
      notes: data.notes ?? undefined,
      createdAt: data.created_at,
      status: data.status as EnquiryStatus,
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
    if (supabase) {
      supabase.from('enquiries').update({ status }).eq('id', id);
    }
  };

  const deleteEnquiry = (id: string) => {
    const updated = enquiries.filter(e => e.id !== id);
    setEnquiries(updated);
    localStorage.setItem(ENQUIRIES_STORAGE_KEY, JSON.stringify(updated));
    if (supabase) {
      supabase.from('enquiries').delete().eq('id', id);
    }
  };

  return { enquiries, saveEnquiry, updateEnquiryStatus, deleteEnquiry };
};
