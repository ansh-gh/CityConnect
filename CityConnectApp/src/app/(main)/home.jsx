import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, useTheme, IconButton, Avatar, Surface, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useProfile } from '../../features/auth/hooks/useAuth';

const { width } = Dimensions.get('window');
const GRID_ITEM_WIDTH = (width - 40 - 16) / 2;

export default function HomeScreen() {
    const theme = useTheme();
    const router = useRouter();

    // Fetch the logged-in user's profile data
    const { data: user } = useProfile();
    const fullName = user?.full_name || user?.name || 'Citizen';
    const initials = fullName.substring(0, 2).toUpperCase();

    // Dynamic greeting based on device time
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    // Reusable Grid Card for Polls and Feedback
    const GridCard = ({ title, subtitle, icon, routeName, color }) => (
        <Surface style={[styles.gridCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
            <TouchableOpacity
                style={styles.gridCardTouch}
                onPress={() => router.push(`/(main)/${routeName}`)} // 🟢 Fixed to router.push
                activeOpacity={0.7}
            >
                <View style={[styles.iconWrapper, { backgroundColor: color + '15' }]}>
                    <MaterialCommunityIcons name={icon} size={28} color={color} />
                </View>
                <Text variant="titleMedium" style={styles.gridTitle}>{title}</Text>
                <Text variant="bodySmall" style={styles.gridSubtitle} numberOfLines={2}>{subtitle}</Text>
            </TouchableOpacity>
        </Surface>
    );

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            {/* Header Section */}
            <View style={styles.header}>
                <View style={styles.headerProfile}>
                    <Avatar.Text
                        size={48}
                        label={initials}
                        style={{ backgroundColor: theme.colors.primaryContainer }}
                        color={theme.colors.onPrimaryContainer}
                    />
                    <View style={styles.headerText}>
                        <Text variant="titleMedium" style={{ opacity: 0.7 }}>{getGreeting()},</Text>
                        <Text variant="headlineSmall" style={{ fontWeight: 'bold', marginTop: -2 }} numberOfLines={1}>
                            {fullName}
                        </Text>
                    </View>
                </View>
                <IconButton
                    icon="bell-outline"
                    mode="contained-tonal"
                    size={24}
                    onPress={() => Alert.alert('Coming Soon', 'Notifications will be available in the next update.')} // BUG-16 fix: use Alert.alert() not global alert()
                />
            </View>

            {/* Hero Card - Main Call to Action */}
            <Card style={[styles.heroCard, { backgroundColor: theme.colors.primary }]} elevation={4}>
                <Card.Content>
                    <View style={styles.heroHeader}>
                        <MaterialCommunityIcons name="shield-home-outline" size={32} color={theme.colors.onPrimary} />
                        <Text variant="titleLarge" style={[styles.heroTitle, { color: theme.colors.onPrimary }]}>
                            Your Voice Matters
                        </Text>
                    </View>
                    <Text variant="bodyMedium" style={[styles.heroSubtitle, { color: theme.colors.onPrimary }]}>
                        Help keep our city clean and safe. Report civic issues instantly directly to the municipal authorities.
                    </Text>
                    <Button
                        mode="elevated"
                        buttonColor={theme.colors.surface}
                        textColor={theme.colors.primary}
                        style={styles.heroBtn}
                        icon="plus"
                        onPress={() => router.push('/(main)/complaints/create')}
                    >
                        File a Complaint
                    </Button>
                </Card.Content>
            </Card>

            <Text variant="titleLarge" style={styles.sectionTitle}>Civic Services</Text>

            {/* Grid Layout for Secondary Actions */}
            <View style={styles.gridContainer}>
                <GridCard
                    title="Polls"
                    subtitle="Vote on local decisions"
                    icon="poll"
                    routeName="polls"
                    color="#007AFF" // Blue
                />
                <GridCard
                    title="Feedback"
                    subtitle="Rate resolved issues"
                    icon="comment-quote-outline"
                    routeName="feedback"
                    color="#00A86B" // Green
                />
            </View>

            {/* Smart Parking Card (Full Width Integration) */}
            <Card
                style={[styles.serviceCard, { backgroundColor: theme.colors.surface }]}
                elevation={2}
                onPress={() => router.push('/(main)/parking')} // 🟢 Fixed to router.push
            >
                <Card.Content style={styles.serviceCardContent}>
                    <View style={[styles.iconWrapper, { backgroundColor: '#FF980015', marginBottom: 0, marginRight: 16 }]}>
                        <MaterialCommunityIcons name="car-connected" size={28} color="#FF9800" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>Smart Parking</Text>
                        <Text variant="bodySmall" style={{ opacity: 0.7, marginTop: 2 }}>
                            Find and book nearby parking slots instantly.
                        </Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
                </Card.Content>
            </Card>

            {/* Emergency SOS Banner (Full Width for emphasis) */}
            <Surface style={[styles.emergencyBanner, { borderColor: theme.colors.error + '50' }]} elevation={1}>
                <TouchableOpacity
                    style={styles.emergencyTouch}
                    onPress={() => router.push('/(main)/emergency')} // 🟢 Fixed to router.push with correct path group
                    activeOpacity={0.7}
                >
                    <View style={[styles.iconWrapper, { backgroundColor: theme.colors.error + '15', marginRight: 16, marginBottom: 0 }]}>
                        <MaterialCommunityIcons name="alert-octagon-outline" size={32} color={theme.colors.error} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.error }}>Emergency SOS</Text>
                        <Text variant="bodySmall" style={{ opacity: 0.7, marginTop: 2 }}>
                            Quick access to police, fire, and medical emergency contacts.
                        </Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.error} />
                </TouchableOpacity>
            </Surface>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20, paddingTop: 60, paddingBottom: 110 },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
    headerProfile: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 },
    headerText: { marginLeft: 12, flex: 1 },

    heroCard: { borderRadius: 20, marginBottom: 28, overflow: 'hidden' },
    heroHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    heroTitle: { fontWeight: 'bold', marginLeft: 10 },
    heroSubtitle: { opacity: 0.9, marginBottom: 20, lineHeight: 22 },
    heroBtn: { borderRadius: 12, alignSelf: 'flex-start' },

    sectionTitle: { fontWeight: 'bold', marginBottom: 16, opacity: 0.9 },

    gridContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    gridCard: { width: GRID_ITEM_WIDTH, borderRadius: 16, overflow: 'hidden' },
    gridCardTouch: { padding: 16, flex: 1 },

    iconWrapper: { width: 50, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    gridTitle: { fontWeight: 'bold', marginBottom: 4 },
    gridSubtitle: { opacity: 0.6, fontSize: 12, lineHeight: 16 },

    serviceCard: { borderRadius: 16, marginBottom: 16 },
    serviceCardContent: { flexDirection: 'row', alignItems: 'center' },

    emergencyBanner: { borderRadius: 16, borderWidth: 1, backgroundColor: '#FFF5F5', marginTop: 8 },
    emergencyTouch: { flexDirection: 'row', alignItems: 'center', padding: 16 },
});