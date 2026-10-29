import React from 'react';
import './PhotoCredit.css';

// Credit line for free-licensed photos (design.md 4.11). Shown only under a photo that is shown.
export interface ImageCredit {
  author?: string;
  license?: string;
  license_url?: string;
  source_url?: string;
  source?: string;
}

const PhotoCredit: React.FC<{ credit?: ImageCredit }> = ({ credit }) => {
  if (!credit?.source_url) return null;
  return (
    <p className="photo-credit">
      Photo: <a href={credit.source_url} target="_blank" rel="noopener noreferrer">{credit.author || 'Unknown author'}</a>
      {credit.license && (
        <>
          {', '}
          {credit.license_url
            ? <a href={credit.license_url} target="_blank" rel="noopener noreferrer">{credit.license}</a>
            : credit.license}
        </>
      )}
      {credit.source && ` via ${credit.source}`}
    </p>
  );
};

export default PhotoCredit;
