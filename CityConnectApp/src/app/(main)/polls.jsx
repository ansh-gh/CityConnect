import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Surface, Button, useTheme, ActivityIndicator, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useGetPolls, useVotePoll } from '../../features/polls/hooks/usePolls';

export default function PollsScreen() {
    const theme = useTheme();
    const { data: polls = [], isLoading, refetch, isRefetching } = useGetPolls();
    const { mutate: vote } = useVotePoll();
    const [activeVoteId, setActiveVoteId] = useState(null);

    const handleVote = (pollId, optionId) => {
        setActiveVoteId(pollId);
        vote({ pollId, optionId }, {
            onSuccess: () => setActiveVoteId(null),
            onError: (err) => { setActiveVoteId(null); alert(err?.response?.data?.message || 'Failed to submit vote'); }
        });
    };

    if (isLoading && !isRefetching) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView 
            style={[styles.container, { backgroundColor: theme.colors.background }]} 
            contentContainerStyle={styles.content}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[theme.colors.primary]} />}
        >
            <View style={styles.header}>
                <View style={[styles.iconWrapper, { backgroundColor: theme.colors.primary + '15' }]}>
                    <MaterialCommunityIcons name="poll" size={32} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text variant="headlineMedium" style={styles.headerTitle}>Community Polls</Text>
                    <Text variant="bodyMedium" style={{ opacity: 0.6 }}>Shape your city's future</Text>
                </View>
            </View>

            {polls.length === 0 ? (
                <View style={styles.emptyState}>
                    <MaterialCommunityIcons name="clipboard-text-outline" size={64} color={theme.colors.onSurfaceVariant} style={{ opacity: 0.2 }} />
                    <Text style={{ marginTop: 16, opacity: 0.6 }}>No active polls available.</Text>
                </View>
            ) : (
                polls.map((poll) => {
                    const optionsList = poll.options || [];
                    // BUG-09 fix: votes are now on each option object directly (from getPollResults)
                    const totalVotes = optionsList.reduce((sum, o) => sum + Number(o.votes || 0), 0);
                    const isVotingOnThisPoll = activeVoteId === poll.id;

                    return (
                        <Surface key={poll.id} style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
                            <Text variant="titleLarge" style={styles.cardTitle}>{poll.title}</Text>
                            {poll.description ? <Text variant="bodyMedium" style={styles.desc}>{poll.description}</Text> : null}
                            
                            <Divider style={styles.divider} />

                            {optionsList.map((opt) => {
                                // BUG-09 fix: votes are directly on opt (from getPollResults via usePolls)
                                const voteCount = Number(opt.votes || 0);
                                const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

                                return (
                                    <View key={opt.id} style={styles.optionBlock}>
                                        <View style={styles.resultTextRow}>
                                            <Text variant="bodyMedium" style={{ fontWeight: '600' }}>{opt.option_text}</Text>
                                            <Text variant="bodySmall" style={{ opacity: 0.7, fontWeight: 'bold' }}>{percentage}%</Text>
                                        </View>

                                        <View style={[styles.progressBarBackground, { backgroundColor: theme.colors.surfaceVariant }]}>
                                            <View style={[styles.progressBarFill, { width: `${percentage}%`, backgroundColor: theme.colors.primary }]} />
                                        </View>

                                        <Button
                                            mode="contained-tonal"
                                            onPress={() => handleVote(poll.id, opt.id)}
                                            disabled={isVotingOnThisPoll || activeVoteId !== null}
                                            loading={isVotingOnThisPoll}
                                            style={styles.voteButton}
                                            labelStyle={{ fontSize: 13, fontWeight: 'bold' }}
                                        >
                                            Vote
                                        </Button>
                                    </View>
                                );
                            })}
                            <Text variant="bodySmall" style={styles.totalVotes}>{totalVotes} citizens voted</Text>
                        </Surface>
                    );
                })
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20, paddingTop: 60, paddingBottom: 110 },
    centered: { justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 16 },
    headerTitle: { fontWeight: 'bold' },
    iconWrapper: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    emptyState: { alignItems: 'center', marginTop: 60 },
    card: { marginBottom: 20, borderRadius: 20, padding: 20 },
    cardTitle: { fontWeight: 'bold', marginBottom: 6 },
    desc: { opacity: 0.7, marginBottom: 12 },
    divider: { marginVertical: 12 },
    optionBlock: { marginBottom: 16 },
    resultTextRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    progressBarBackground: { height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: 10 },
    progressBarFill: { height: '100%', borderRadius: 5 },
    voteButton: { alignSelf: 'flex-start', borderRadius: 20 },
    totalVotes: { opacity: 0.5, marginTop: 8, fontSize: 12, textAlign: 'center', fontWeight: 'bold' }
});