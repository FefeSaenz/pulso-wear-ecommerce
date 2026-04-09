import React from 'react';
import SectionTitle from '@/src/components/ui/SectionTitle';

const LOCATIONS = [
  {
    name: 'PULSO Paraná',
    address: 'Buenos Aires 60 - Paseo de las luces, Paraná, Entre Ríos',
    hours: 'Lun - Sáb: 17:00 - 20:00',
    phone: '+54 343 4234 567',
    googleMapsLink: 'https://www.google.com/maps/search/?api=1&query=Buenos+Aires+60+Parana+Entre+Rios'
  }
];

const LocationsSection: React.FC = () => {
  return (
    <section id="locals-section" className="w-full flex flex-col gap-6 bg-white">
      <SectionTitle title="Store" />
      <div className="max-w-360 mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-12 order-2 lg:order-1">
            {LOCATIONS.map((loc, idx) => (
              <div key={idx} className="border-l-2 border-gray-100 pl-8 hover:border-black transition-colors">
                <h3 className="text-xl font-black uppercase tracking-tight mb-2">{loc.name}</h3>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-4">{loc.address}</p>
                <div className="space-y-1 text-[10px] font-bold text-gray-400 uppercase tracking-[2px]">
                  <p><i className="fa-regular fa-clock mr-2"></i>{loc.hours}</p>
                  <p><i className="fa-solid fa-phone mr-2"></i>{loc.phone}</p>
                </div>
                <a 
                  href={loc.googleMapsLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-6 inline-block text-[9px] font-black uppercase tracking-[3px] border border-black px-6 py-2 hover:bg-black hover:text-white transition-all"
                >
                  Cómo llegar
                </a>
              </div>
            ))}
          </div>

          <div className="h-112.5 bg-gray-100 relative order-1 lg:order-2 overflow-hidden shadow-2xl grayscale hover:grayscale-0 transition-all duration-700">
            <iframe
              src="https://maps.google.com/maps?q=-31.731212,-60.531179&t=&z=17&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="PULSO Location Map"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationsSection;
