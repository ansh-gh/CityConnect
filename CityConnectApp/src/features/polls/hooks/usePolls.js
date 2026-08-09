import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pollApi } from '../api/pollApi';

export const useGetPolls = () => {
    return useQuery({
        queryKey: ['polls'],
        queryFn: async () => {
            const response = await pollApi.getPolls();
            const rawPolls = response.polls || response || [];

            // BUG-07 fix: was making 2 extra calls per poll (getPollById + getPollResults).
            // getPollResults already returns { results: [{id, option_text, votes}] } — all we need.
            // This cuts N+1 extra requests down to just N (one getPollResults per poll).
            const detailedPolls = await Promise.all(
                rawPolls.map(async (poll) => {
                    try {
                        const resultsRes = await pollApi.getPollResults(poll.id);
                        // BUG-09 fix: resultsRes.results already has votes; put them directly on options
                        return {
                            ...poll,
                            options: resultsRes.results || [],
                        };
                    } catch (e) {
                        return { ...poll, options: [] };
                    }
                })
            );
            return detailedPolls;
        },
        staleTime: 1000 * 60,
    });
};

export const useVotePoll = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ pollId, optionId }) => pollApi.votePoll(pollId, optionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['polls'] });
        },
    });
};