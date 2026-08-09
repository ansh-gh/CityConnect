import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, RefreshControl } from 'react-native';
import { Text, TextInput, Button, Surface, useTheme, ActivityIndicator, Divider, IconButton } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUserFeedback, useSubmitFeedback, useDeleteFeedback } from '../../features/feedbacks/hooks/useFeedback';

export default function FeedbackScreen() {
    const theme = useTheme();
    const params = useLocalSearchParams();
    const router = useRouter();

    const [complaintId, setComplaintId] = useState('');
    const [rating, setRating] = useState(5);
    const [feedbackText, setFeedbackText] = useState('');
    const [isLocked, setIsLocked] = useState(false);

    useEffect(() => {
        if (params?.complaintId) {
            setComplaintId(String(params.complaintId));
            setIsLocked(true);
        } else {
            setComplaintId('');
            setIsLocked(false);
        }
    }, [params?.complaintId]);

    const { data: responseData, isLoading, refetch, isRefetching } = useUserFeedback();
    const feedbackHistory = Array.isArray(responseData) ? responseData : [];
    const { mutate: submitFeedback, isPending: isSubmitting } = useSubmitFeedback();
    const { mutate: deleteFeedback, isPending: isDeleting } = useDeleteFeedback();

    const handleSubmit = () => {
        if (!complaintId.trim() || !feedbackText.trim()) {
            alert('Please provide a complaint ID and feedback text.');
            return;
        }

        submitFeedback(
            {
                complaint_id: Number(complaintId),
                rating: rating,
                feedback: feedbackText.trim()
            },
            {
                onSuccess: () => {
                    setFeedbackText('');
                    setRating(5);
                    if (!isLocked) {
                        setComplaintId('');
                    }
                    alert('Feedback submitted successfully');
                    // BUG-10 fix: router.back() is unreliable on a tab-level screen.
                    // Navigate to home so the user always lands somewhere sensible.
                    router.replace('/(main)/home');
                },
                onError: (err) => {
                    alert(err?.response?.data?.message || 'Failed to submit feedback');
                }
            }
        );
    };

    const handleDelete = (feedbackId) => {
        deleteFeedback(feedbackId, {
            onSuccess: () => alert('Feedback deleted successfully'),
            onError: (err) => alert(err?.response?.data?.message || 'Failed to delete feedback')
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
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView 
                style={{ backgroundColor: theme.colors.background }} 
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl 
                        refreshing={isRefetching} 
                        onRefresh={refetch} 
                        colors={[theme.colors.primary]} 
                    />
                }
            >
                {/* Header Section */}
                <View style={styles.header}>
                    <Text variant="headlineMedium" style={styles.headerTitle}>Feedback</Text>
                    <Text variant="bodyMedium" style={{ opacity: 0.6 }}>Rate our civic services</Text>
                </View>

                {/* Main Feedback Form Card */}
                <Surface style={[styles.formCard, { backgroundColor: theme.colors.surface }]} elevation={3}>
                    <View style={styles.formHeader}>
                        <View style={[styles.iconWrapper, { backgroundColor: '#00A86B15' }]}>
                            <MaterialCommunityIcons name="star-shooting" size={28} color="#00A86B" />
                        </View>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold', flex: 1 }}>
                            {isLocked ? `Rate Complaint #${complaintId}` : 'Submit New Feedback'}
                        </Text>
                    </View>
                    
                    <TextInput 
                        label="Complaint ID" 
                        mode="outlined" 
                        keyboardType="numeric" 
                        value={complaintId} 
                        onChangeText={setComplaintId} 
                        disabled={isLocked} 
                        style={styles.input} 
                        outlineColor={theme.colors.outlineVariant}
                    />

                    <View style={styles.ratingContainer}>
                        <Text variant="bodyLarge" style={{ marginRight: 12, fontWeight: 'bold' }}>Rating:</Text>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7}>
                                <MaterialCommunityIcons 
                                    name={star <= rating ? "star" : "star-outline"} 
                                    size={36} 
                                    color={star <= rating ? "#FFD700" : theme.colors.surfaceVariant} 
                                    style={{ marginRight: 4 }} 
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TextInput 
                        label="Tell us about your experience" 
                        mode="outlined" 
                        multiline 
                        numberOfLines={3} 
                        value={feedbackText} 
                        onChangeText={setFeedbackText} 
                        style={styles.inputArea} 
                        outlineColor={theme.colors.outlineVariant}
                    />

                    <Button 
                        mode="contained" 
                        onPress={handleSubmit} 
                        loading={isSubmitting} 
                        disabled={isSubmitting} 
                        style={styles.submitBtn} 
                        buttonColor="#00A86B"
                        contentStyle={{ height: 50 }}
                        labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
                    >
                        Submit Feedback
                    </Button>
                </Surface>

                {/* History Section */}
                <Text variant="titleLarge" style={styles.sectionTitle}>History</Text>

                {feedbackHistory.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="comment-text-outline" size={48} color={theme.colors.onSurfaceVariant} style={{ opacity: 0.2 }} />
                        <Text style={{ opacity: 0.5, marginTop: 12 }}>No feedback history found.</Text>
                    </View>
                ) : (
                    feedbackHistory.map((item) => (
                        <Surface key={item.id} style={[styles.historyCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
                            <View style={styles.historyRow}>
                                <View style={[styles.iconWrapperSmall, { backgroundColor: '#FFD70020' }]}>
                                    <Text style={{ fontWeight: 'bold', color: '#B8860B' }}>{item.rating}</Text>
                                    <MaterialCommunityIcons name="star" size={14} color="#B8860B" />
                                </View>
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>
                                        {item.ticket_no ? `Ticket: ${item.ticket_no}` : `Complaint #${item.complaint_id}`}
                                    </Text>
                                    {item.title && <Text variant="bodySmall" style={{ opacity: 0.6 }}>{item.title}</Text>}
                                </View>
                                <IconButton 
                                    icon="delete-outline" 
                                    iconColor={theme.colors.error} 
                                    size={22} 
                                    disabled={isDeleting}
                                    onPress={() => handleDelete(item.id)} 
                                    style={{ margin: 0 }}
                                />
                            </View>
                            <Divider style={{ marginVertical: 12 }} />
                            <Text variant="bodyMedium" style={{ opacity: 0.8 }}>{item.feedback}</Text>
                        </Surface>
                    ))
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20, paddingTop: 60, paddingBottom: 110 },
    centered: { justifyContent: 'center', alignItems: 'center' },
    
    header: { marginBottom: 24 },
    headerTitle: { fontWeight: 'bold' },
    
    formCard: { padding: 20, borderRadius: 24, marginBottom: 32 },
    formHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 },
    iconWrapper: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    
    input: { marginBottom: 16, backgroundColor: 'transparent' },
    inputArea: { marginBottom: 24, backgroundColor: 'transparent' },
    ratingContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingVertical: 8 },
    submitBtn: { borderRadius: 16 },
    
    sectionTitle: { fontWeight: 'bold', marginBottom: 16, opacity: 0.9 },
    emptyState: { alignItems: 'center', marginTop: 20 },
    
    historyCard: { padding: 16, borderRadius: 16, marginBottom: 12 },
    historyRow: { flexDirection: 'row', alignItems: 'center' },
    iconWrapperSmall: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4 }
});