import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme, Button, Surface, Divider, IconButton, ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useParkingZones, useAvailableSlots, useCreateBooking } from '../../../features/parking/hooks/useParking';

export default function ParkingDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    
    const [hours, setHours] = useState(1);

    // Fetch real data!
    const { data: zones } = useParkingZones();
    const { data: slots, isLoading: loadingSlots } = useAvailableSlots(id);
    const { mutate: createBooking, isPending: isBooking } = useCreateBooking();

    const lot = zones?.find(p => p.id.toString() === id);

    // Use router.back() for standard stack navigation behavior
    const handleGoBack = () => router.back();

    if (!lot) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
                <Stack.Screen options={{ headerShown: false }} />
                <Text style={{ marginBottom: 16 }}>Parking lot not found.</Text>
                <Button mode="contained" onPress={handleGoBack}>Go Back</Button>
            </View>
        );
    }

    const isFull = lot.available_spots === 0 || !slots?.length;
    const totalCost = lot.price_per_hour * hours;

    // Safely grab the first available slot to avoid race-condition crashes
    const selectedSlot = slots && slots.length > 0 ? slots[0] : null;

    const handleBook = () => {
        if (isFull || !selectedSlot) return;
        
        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + hours * 60 * 60 * 1000);

        createBooking(
            {
                slot_id: selectedSlot.id,
                booking_start: startTime.toISOString(),
                booking_end: endTime.toISOString()
            },
            {
                onSuccess: () => {
                    // Replace prevents the user from swiping back to the booking form!
                    router.replace('/(main)/parking/my-bookings');
                },
                onError: (error) => {
                    alert(error?.response?.data?.message || "Booking failed");
                }
            }
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={[styles.customHeader, { paddingTop: Math.max(insets.top, 16) }]}>
                <IconButton icon="arrow-left" size={28} onPress={handleGoBack} style={{ margin: 0 }} />
                <Text variant="titleLarge" style={{ fontWeight: 'bold', marginLeft: 8 }}>Booking Details</Text>
            </View>

            {/* BUG-11 fix: paddingBottom must clear the fixed footer (~88px) plus safe area */}
            <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]} showsVerticalScrollIndicator={false}>
                <Surface style={[styles.heroCard, { backgroundColor: theme.colors.primary }]} elevation={2}>
                    <Text variant="headlineSmall" style={[styles.heroTitle, { color: theme.colors.onPrimary }]}>{lot.name}</Text>
                    <View style={styles.heroStats}>
                        <View style={styles.statItem}>
                            <MaterialCommunityIcons name="currency-inr" size={20} color={theme.colors.onPrimary} />
                            <Text style={[styles.statText, { color: theme.colors.onPrimary }]}>{lot.price_per_hour}/hr</Text>
                        </View>
                    </View>
                </Surface>

                <View style={styles.availabilitySection}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 16 }}>Current Availability</Text>
                    <View style={styles.spotIndicator}>
                        <Surface style={[styles.spotCircle, { backgroundColor: isFull ? theme.colors.error : '#00A86B' }]} elevation={3}>
                            {loadingSlots ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text variant="headlineMedium" style={{ color: '#fff', fontWeight: 'bold' }}>{lot.available_spots}</Text>
                            )}
                        </Surface>
                        <View style={{ marginLeft: 16 }}>
                            <Text variant="bodyLarge" style={{ opacity: 0.7 }}>
                                out of <Text style={{ fontWeight: 'bold' }}>{lot.total_spots}</Text> spots
                            </Text>
                            <Text variant="bodyMedium" style={{ color: isFull ? theme.colors.error : '#00A86B', fontWeight: 'bold', marginTop: 2 }}>
                                {isFull ? 'Parking Full' : 'Available Now'}
                            </Text>
                        </View>
                    </View>
                </View>

                <Divider style={{ marginVertical: 28 }} />

                <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 16 }}>Select Duration</Text>
                <View style={styles.durationSelector}>
                    <IconButton icon="minus" mode="contained-tonal" size={28} onPress={() => setHours(Math.max(1, hours - 1))} disabled={isFull || hours === 1} />
                    <Text variant="headlineMedium" style={{ fontWeight: 'bold', width: 80, textAlign: 'center' }}>
                        {hours} <Text variant="bodyLarge" style={{ opacity: 0.6 }}> {hours === 1 ? 'hr' : 'hrs'}</Text>
                    </Text>
                    <IconButton icon="plus" mode="contained-tonal" size={28} onPress={() => setHours(hours + 1)} disabled={isFull || hours >= 24} />
                </View>

                <Surface style={[styles.receiptCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]} elevation={0}>
                    <View style={styles.receiptRow}>
                        <Text variant="bodyLarge" style={{ opacity: 0.7 }}>Parking Rate</Text>
                        <Text variant="bodyLarge" style={{ fontWeight: '500' }}>₹{lot.price_per_hour}/hr</Text>
                    </View>
                    <View style={styles.receiptRow}>
                        <Text variant="bodyLarge" style={{ opacity: 0.7 }}>Duration</Text>
                        <Text variant="bodyLarge" style={{ fontWeight: '500' }}>{hours} Hours</Text>
                    </View>
                    <Divider style={{ marginVertical: 12 }} />
                    <View style={styles.receiptRow}>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>Total Amount</Text>
                        <Text variant="titleLarge" style={{ fontWeight: 'bold', color: theme.colors.primary }}>₹{totalCost}</Text>
                    </View>
                </Surface>
            </ScrollView>

            <Surface style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.outlineVariant, paddingBottom: Math.max(insets.bottom, 16) + 80 }]} elevation={4}>
                <Button mode="contained" onPress={handleBook} loading={isBooking} disabled={isFull || isBooking || loadingSlots || !selectedSlot} style={styles.bookButton} contentStyle={{ height: 56 }} labelStyle={{ fontSize: 16, fontWeight: 'bold' }}>
                    {isFull ? 'Lot Full' : `Confirm & Pay ₹${totalCost}`}
                </Button>
            </Surface>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { justifyContent: 'center', alignItems: 'center' },
    customHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingBottom: 8 },
    scrollContent: { padding: 16 },
    heroCard: { padding: 24, borderRadius: 24, marginBottom: 28 },
    heroTitle: { fontWeight: 'bold', marginBottom: 16 },
    heroStats: { flexDirection: 'row', gap: 24 },
    statItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    statText: { fontSize: 15, fontWeight: '600' },
    availabilitySection: { paddingHorizontal: 4 },
    spotIndicator: { flexDirection: 'row', alignItems: 'center' },
    spotCircle: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center' },
    durationSelector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
    receiptCard: { padding: 20, borderRadius: 20, borderWidth: 1, marginBottom: 16 },
    receiptRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    footer: { padding: 16, borderTopWidth: 1 },
    bookButton: { borderRadius: 16 },
});