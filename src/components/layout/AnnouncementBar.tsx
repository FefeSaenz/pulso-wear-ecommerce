import React from 'react';

interface AnnouncementBarProps {
  messages: string[];
  speed?: number; // Opcional, para controlar la velocidad
}

const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ messages, speed = 60 }) => {
  const separator = '      ▪      '; 
  
  const contentString = messages.join(separator) + separator;

  return (
    <div className="bg-black text-white py-3 overflow-hidden flex">
      <div 
        className="flex w-max text-[10px] font-black uppercase tracking-[5px]"
        style={{ animation: `marquee ${speed}s linear infinite` }}
      >
        <span className="px-4 whitespace-pre">{contentString.repeat(4)}</span>
        <span className="px-4 whitespace-pre">{contentString.repeat(4)}</span>
      </div>
    </div>
  );
};

export default AnnouncementBar;