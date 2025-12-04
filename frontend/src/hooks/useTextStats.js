import { useState, useEffect } from "react";

export const useTextStats = (text) => {
  const [stats, setStats] = useState({ chars: 0, words: 0, sentences: 0 });

  useEffect(() => {
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const sentences = text.trim()
      ? text.split(/[.!?]+/).filter((sentence) => sentence.trim().length > 0)
          .length
      : 0;

    setStats({ chars, words, sentences });
  }, [text]);

  return stats;
};
