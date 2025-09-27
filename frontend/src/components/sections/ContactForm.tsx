'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export function ContactForm() {
  const t = useTranslations('contact.form');
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: formData.message,
          status: 'pending',
          customer: {
            fullName: formData.name,
            phone: formData.phone,
            email: formData.email
          }
        })
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: ''
        });
        // Reset success message after 5 seconds
        setTimeout(() => setSubmitStatus('idle'), 5000);
      } else {
        setSubmitStatus('error');
        // Reset error message after 5 seconds
        setTimeout(() => setSubmitStatus('idle'), 5000);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
      // Reset error message after 5 seconds
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('title')}</h3>
        <p className="text-gray-600">Size en kısa sürede dönüş yapacağız</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              {t('name')} *
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              placeholder={t('namePlaceholder')}
              required
              className="w-full h-12 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              {t('email')} *
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder={t('emailPlaceholder')}
              required
              className="w-full h-12 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            {t('phone')} *
          </label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder={t('phonePlaceholder')}
            required
            className="w-full h-12 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="message" className="block text-sm font-medium text-gray-700">
            {t('message')} *
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            placeholder={t('messagePlaceholder')}
            required
            rows={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 resize-none"
          />
        </div>

        {/* Status Messages */}
        {submitStatus === 'success' && (
          <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-4 rounded-xl">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.</span>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-xl">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span>Gönderiliyor...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Send className="h-5 w-5" />
              <span>{t('submit')}</span>
            </div>
          )}
        </Button>
      </form>
    </div>
  );
}
