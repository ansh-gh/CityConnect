import React from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, Chip, FAB, useTheme, ActivityIndicator, Button } from 'react-native-paper'; // Added Button import
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useGetMyComplaints } from '../../../features/complaints/hooks/useComplaints';

export default function ComplaintsScreen() {
    const theme = useTheme();
    const router = useRouter();
    const { data: complaints, isLoading, isError, refetch, isRefetching } = useGetMyComplaints();

    // 1. Handle Error State FIRST
    if (isError) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background, padding: 20 }]}>
                <Text variant="titleMedium" style={{ color: theme.colors.error, marginBottom: 16 }}>
                    Failed to load complaints.
                </Text>
                <Button mode="contained" onPress={() => refetch()}>
                    Try Again
                </Button>
            </View>
        );
    }

    // 2. Handle Loading State
    if (isLoading && !isRefetching) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    const getStatusConfig = (status) => {
        const safeStatus = status ? status.toLowerCase() : '';
        switch (safeStatus) {
            case 'resolved': return { color: '#00A86B', icon: 'check-circle' };
            case 'in progress': return { color: '#FF9800', icon: 'progress-wrench' };
            default: return { color: '#D32F2F', icon: 'clock-outline' };
        }
    };

    // 3. Handle Empty State or List Render
    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {!complaints || complaints.length === 0 ? (
                <View style={[styles.container, styles.centered]}>
                    <MaterialCommunityIcons name="clipboard-text-off-outline" size={64} color={theme.colors.onSurfaceVariant} style={{ opacity: 0.2 }} />
                    <Text variant="bodyLarge" style={{ opacity: 0.6, marginTop: 12 }}>No complaints filed yet.</Text>
                </View>
            ) : (
                <FlatList
                    data={complaints}
                    keyExtractor={(item) => (item.id || item._id).toString()}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl 
                            refreshing={isRefetching} 
                            onRefresh={refetch} 
                            colors={[theme.colors.primary]} 
                        />
                    }
                    renderItem={({ item }) => {
                        const statusConfig = getStatusConfig(item.status);
                        return (
                            <Card 
                                style={[styles.card, { backgroundColor: theme.colors.surface }]} 
                                elevation={2}
                                onPress={() => router.push(`/(main)/complaints/${item.id || item._id}`)}
                            >
                                <Card.Content>
                                    <View style={styles.cardHeader}>
                                        <Text variant="titleMedium" style={styles.title} numberOfLines={1}>
                                            {item.title || item.category}
                                        </Text>
                                        <Chip 
                                            icon={statusConfig.icon}
                                            textStyle={{ color: statusConfig.color, fontSize: 12, fontWeight: 'bold' }} 
                                            style={{ backgroundColor: statusConfig.color + '15' }}
                                        >
                                            {item.status || 'Pending'}
                                        </Chip>
                                    </View>
                                    <Text variant="bodyMedium" numberOfLines={2} style={styles.description}>
                                        {item.description}
                                    </Text>
                                    <Text variant="bodySmall" style={styles.date}>
                                        Filed on: {new Date(item.created_at || Date.now()).toLocaleDateString()}
                                    </Text>
                                </Card.Content>
                            </Card>
                        );
                    }}
                />
            )}

            <FAB
                icon="plus"
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                color="#ffffff"
                onPress={() => router.push('/(main)/complaints/create')}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { justifyContent: 'center', alignItems: 'center' },
    listContainer: { padding: 16, paddingBottom: 140 },
    card: { marginBottom: 16, borderRadius: 20 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    title: { fontWeight: 'bold', flex: 1, marginRight: 8 },
    description: { opacity: 0.7, marginBottom: 12, lineHeight: 20 },
    date: { opacity: 0.5, fontSize: 11 },
    fab: { 
        position: 'absolute', 
        right: 16, 
        bottom: 90, 
        elevation: 6,
        borderRadius: 16
    },
});