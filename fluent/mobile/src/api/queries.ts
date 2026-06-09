import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';

// Prefetch helpers
export async function prefetchNextDeck(queryClient: any, theme: string, count: number = 8) {
  await queryClient.prefetchQuery({
    queryKey: ['vocab_deck', theme, count],
    queryFn: () => api.getVocabDeck(theme, count),
    staleTime: 5 * 60 * 1000,
  });
}

export async function prefetchSpeakingPassage(queryClient: any, theme: string, level: string) {
  // @ts-ignore
  if (api.getPassage) {
    await queryClient.prefetchQuery({
      queryKey: ['speaking_passage', theme, level],
      // @ts-ignore
      queryFn: () => api.getPassage(theme, level),
      staleTime: 5 * 60 * 1000,
    });
  }
}

// Hooks
export function useCurriculum() {
  return useQuery({
    queryKey: ['curriculum_today'],
    queryFn: () => api.getCurriculumToday(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useProgress() {
  return useQuery({
    queryKey: ['progress_me'],
    queryFn: () => api.getProgress(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useDeck(theme: string = 'corporate', count: number = 8) {
  return useQuery({
    queryKey: ['vocab_deck', theme, count],
    queryFn: () => api.getVocabDeck(theme, count),
    staleTime: 5 * 60 * 1000,
  });
}

export function useThemes() {
  return useQuery({
    queryKey: ['vocab_themes'],
    queryFn: () => api.getVocabThemes(),
    staleTime: 24 * 60 * 60 * 1000, // Themes rarely change
  });
}

export function useGrammarLesson(topic: string, level: string = 'intermediate') {
  return useQuery({
    queryKey: ['grammar_lesson', topic, level],
    queryFn: () => api.generateGrammarLesson(topic, level),
    staleTime: 5 * 60 * 1000,
    enabled: !!topic,
  });
}

export function useSrsDue(limit: number = 20) {
  return useQuery({
    queryKey: ['srs_due', limit],
    queryFn: () => api.getSrsDue(limit),
    staleTime: 1 * 60 * 1000,
  });
}

export function useSrsStats() {
  return useQuery({
    queryKey: ['srs_stats'],
    queryFn: () => api.getSrsStats(),
    staleTime: 1 * 60 * 1000,
  });
}

export function usePassage(theme: string = 'confidence', level: string = 'B1') {
  return useQuery({
    queryKey: ['speaking_passage', theme, level],
    queryFn: () => {
      // @ts-ignore
      if (api.getPassage) {
        // @ts-ignore
        return api.getPassage(theme, level);
      }
      // Fallback if speaking endpoint is not registered yet
      return api.getRandomArticle(level, undefined, 'pronunciation');
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Optimistic mutations
export function useMasterVocabMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (word: string) => api.markVocabMastered(word),
    onMutate: async (word: string) => {
      await queryClient.cancelQueries({ queryKey: ['progress_me'] });
      const previousProgress = queryClient.getQueryData(['progress_me']);
      
      // Optimistic update
      queryClient.setQueryData(['progress_me'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          total_words: (old.total_words || 0) + 1,
          words_mastered: (old.words_mastered || 0) + 1,
        };
      });

      return { previousProgress };
    },
    onError: (err, word, context) => {
      if (context?.previousProgress) {
        queryClient.setQueryData(['progress_me'], context.previousProgress);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['progress_me'] });
      queryClient.invalidateQueries({ queryKey: ['vocab_deck'] });
    },
  });
}

export function useReviewSrsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ word, quality }: { word: string; quality: number }) => api.reviewSrsCard(word, quality),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['srs_due'] });
      await queryClient.cancelQueries({ queryKey: ['srs_stats'] });
      const previousDue = queryClient.getQueryData(['srs_due']);
      const previousStats = queryClient.getQueryData(['srs_stats']);
      
      // Optimistically decrement due count
      queryClient.setQueryData(['srs_stats'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          due_today: Math.max(0, (old.due_today || 0) - 1),
        };
      });

      return { previousDue, previousStats };
    },
    onError: (err, variables, context) => {
      if (context?.previousDue) {
        queryClient.setQueryData(['srs_due'], context.previousDue);
      }
      if (context?.previousStats) {
        queryClient.setQueryData(['srs_stats'], context.previousStats);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['srs_due'] });
      queryClient.invalidateQueries({ queryKey: ['srs_stats'] });
      queryClient.invalidateQueries({ queryKey: ['progress_me'] });
    },
  });
}
