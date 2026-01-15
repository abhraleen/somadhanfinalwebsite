
import { useState, useEffect } from 'react';
import { Enquiry, EnquiryStatus } from '../types';
import { ENQUIRIES_STORAGE_KEY } from '../constants';

export const useEnquiries = () => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(ENQUIRIES_STORAGE_KEY);
    if (stored) {
      setEnquiries(JSON.parse(stored));
    }
  }, []);

  const saveEnquiry = (enquiry: Omit<Enquiry, 'id' | 'createdAt' | 'status'>) => {
    const newEnquiry: Enquiry = {
      ...enquiry,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      status: EnquiryStatus.NEW,
    };
    const updated = [newEnquiry, ...enquiries];
    setEnquiries(updated);
    localStorage.setItem(ENQUIRIES_STORAGE_KEY, JSON.stringify(updated));
    return newEnquiry;
  };

  const updateEnquiryStatus = (id: string, status: EnquiryStatus) => {
    const updated = enquiries.map(e => e.id === id ? { ...e, status } : e);
    setEnquiries(updated);
    localStorage.setItem(ENQUIRIES_STORAGE_KEY, JSON.stringify(updated));
  };

  const deleteEnquiry = (id: string) => {
    const updated = enquiries.filter(e => e.id !== id);
    setEnquiries(updated);
    localStorage.setItem(ENQUIRIES_STORAGE_KEY, JSON.stringify(updated));
  };

  return { enquiries, saveEnquiry, updateEnquiryStatus, deleteEnquiry };
};
