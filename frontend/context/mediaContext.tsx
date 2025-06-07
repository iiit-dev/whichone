import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MediaAsset {
  id: string;
  uri: string;
  mediaType: 'photo' | 'video';
  duration?: number;
  filename: string;
}

interface MediaContextType {
  selectedMedia: MediaAsset[];
  setSelectedMedia: (media: MediaAsset[]) => void;
  clearSelectedMedia: () => void;
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export const MediaProvider = ({ children }: { children: ReactNode }) => {
  const [selectedMedia, setSelectedMedia] = useState<MediaAsset[]>([]);

  const clearSelectedMedia = () => {
    setSelectedMedia([]);
  };

  return (
    <MediaContext.Provider value={{
      selectedMedia,
      setSelectedMedia,
      clearSelectedMedia
    }}>
      {children}
    </MediaContext.Provider>
  );
};

export const useMedia = () => {
  const context = useContext(MediaContext);
  if (context === undefined) {
    throw new Error('useMedia must be used within a MediaProvider');
  }
  return context;
}; 