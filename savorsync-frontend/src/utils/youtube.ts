// Pull the 11-character video id out of any common YouTube link shape
export const getYouTubeId = (url?: string): string | null => {
  if (!url || url.includes('example')) return null;
  const match = url.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/))([A-Za-z0-9_-]{11})/);
  return match ? match[1] : null;
};

export const hasCulturalVideo = (recipe: { shortform_video_url?: string; longform_video_url?: string }): boolean =>
  !!getYouTubeId(recipe.shortform_video_url) || !!getYouTubeId(recipe.longform_video_url);
