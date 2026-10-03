import React from 'react';
import logoImg from '../assets/images/jewel_botanica_logo_1790614222826.jpg';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = '', size = 'md' }) => {
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12 sm:w-14 sm:h-14',
    lg: 'w-20 h-20 sm:w-24 sm:h-24',
  };

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${sizeMap[size]} ${className}`}>
      {/* Crisp Circular Brand Emblem from User's Identity */}
      <img
        src={logoImg}
        alt="Jewel Botanica Silver Jewellery"
        className="w-full h-full object-cover rounded-full shadow-[0_0_15px_rgba(255,255,255,0.08)] border border-[#FFFFFF]/20 hover:border-[#FFFFFF]/50 transition-all duration-300"
      />
    </div>
  );
};
