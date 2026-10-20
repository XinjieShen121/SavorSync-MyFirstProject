import React, { useState } from 'react';
import { getYouTubeId } from '../utils/youtube';
import './CulturalVideo.css';

export interface CulturalVideoProps {
  recipe: {
    recipe_name?: string;
    title?: string;
    shortform_video_url?: string;
    longform_video_url?: string;
  };
  // Start playing as soon as it mounts (e.g. inside a "Watch" dialog)
  autoPlay?: boolean;
}

// Cultural video (design.md 4.4, 5.1): a photo poster with a play button that
// loads the privacy-enhanced YouTube player only when pressed. Renders nothing
// when the recipe has no valid video.
const CulturalVideo: React.FC<CulturalVideoProps> = ({ recipe, autoPlay = false }) => {
  const shortId = getYouTubeId(recipe.shortform_video_url);
  const longId = getYouTubeId(recipe.longform_video_url);
  const videoId = shortId || longId;
  const [playing, setPlaying] = useState(autoPlay);
  const dishName = recipe.recipe_name || recipe.title || 'this dish';

  if (!videoId) return null;

  const title = `The story of ${dishName}`;

  return (
    <figure className="cultural-video">
      <div className="cultural-video__frame">
        {playing ? (
          <iframe
            className="cultural-video__player"
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
          <button type="button" className="cultural-video__poster" onClick={() => setPlaying(true)} aria-label={`Play video: ${title}`}>
            <img
              src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
              alt=""
              className="cultural-video__thumb"
              loading="lazy"
            />
            <span className="cultural-video__play" aria-hidden="true">
              <i className="bi bi-play-fill"></i>
            </span>
          </button>
        )}
      </div>
      <figcaption className="cultural-video__caption">
        <span>{title}</span>
        {shortId && longId && longId !== shortId && (
          <a
            className="cultural-video__more"
            href={`https://www.youtube.com/watch?v=${longId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Watch the full video
            <i className="bi bi-box-arrow-up-right" aria-hidden="true"></i>
          </a>
        )}
      </figcaption>
    </figure>
  );
};

export default CulturalVideo;
