import React, { useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Linking, Platform, ScrollView } from 'react-native';
import { Text, Card, useTheme, Surface, IconButton, Chip, Button, Divider } from 'react-native-paper';
import { Stack, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMyBookings, useCancelBooking } from '../../../features/parking/hooks/useParking';
import QRCode from 'react-native-qrcode-svg';

export default function MyBookingsScreen() {
    const theme = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'active' | 'cancelled'

    const { data: bookings, isLoading, isError, refetch } = useMyBookings();
    const { mutate: cancelBooking, isPending } = useCancelBooking();
    // BUG-12 fix: track which booking is being cancelled in local state for reliable per-card loading
    const [cancellingId, setCancellingId] = useState(null);

    const handleGoBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.push('/(main)/parking');
        }
    };

    const openNativeMaps = (lat, lng, name) => {
        if (!lat || !lng) return;
        const latitude = Number(lat);
        const longitude = Number(lng);
        const label = encodeURIComponent(name || 'Parking Location');

        const url = Platform.select({
            ios: `maps:0,0?q=${label}@${latitude},${longitude}`,
            android: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${label})`
        });

        Linking.openURL(url).catch((err) => console.error('Error opening maps app', err));
    };

    if (isLoading) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={{ marginTop: 16 }}>Loading your passes...</Text>
            </View>
        );
    }

    // Filter bookings based on the pill selection
    const filteredBookings = bookings?.filter(item => {
        const status = (item.booking_status || '').toLowerCase();
        const isActive = status === 'active' || status === 'booked' || status === 'confirmed';
        
        if (filterStatus === 'active') return isActive;
        if (filterStatus === 'cancelled') return !isActive;
        return true;
    }) || [];

    // BUG-04 fix: separate error state from empty-data state
    if (isError) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background, padding: 24 }]}>
                <Stack.Screen options={{ headerShown: false }} />
                <View style={[styles.customHeader, { paddingTop: Math.max(insets.top, 16), position: 'absolute', top: 0, left: 0, width: '100%' }]}>
                    <IconButton icon="arrow-left" size={28} onPress={handleGoBack} />
                    <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>My Passes</Text>
                </View>
                <MaterialCommunityIcons name="wifi-off" size={64} color={theme.colors.error} style={{ opacity: 0.6 }} />
                <Text variant="titleMedium" style={{ fontWeight: 'bold', marginTop: 16, color: theme.colors.error }}>Failed to Load Bookings</Text>
                <Text variant="bodyMedium" style={{ opacity: 0.6, textAlign: 'center', marginTop: 4, marginBottom: 24 }}>
                    Please check your connection and try again.
                </Text>
                <Button mode="contained" onPress={refetch} style={{ borderRadius: 16 }}>
                    Retry
                </Button>
            </View>
        );
    }

    if (!bookings || bookings.length === 0) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background, padding: 24 }]}>
                <Stack.Screen options={{ headerShown: false }} />
                <View style={[styles.customHeader, { paddingTop: Math.max(insets.top, 16), position: 'absolute', top: 0, left: 0, width: '100%' }]}>
                    <IconButton icon="arrow-left" size={28} onPress={handleGoBack} />
                    <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>My Passes</Text>
                </View>
                <MaterialCommunityIcons name="ticket-outline" size={72} color={theme.colors.outline} style={{ opacity: 0.5 }} />
                <Text variant="titleMedium" style={{ fontWeight: 'bold', marginTop: 16 }}>No Parking Passes Found</Text>
                <Text variant="bodyMedium" style={{ opacity: 0.6, textAlign: 'center', marginTop: 4, marginBottom: 24 }}>
                    You haven't booked any parking slots yet. Explore zones to secure your spot.
                </Text>
                <Button mode="contained" onPress={() => router.push('/(main)/parking')} style={{ borderRadius: 16 }}>
                    Find Parking Zones
                </Button>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={[styles.customHeader, { paddingTop: Math.max(insets.top, 16) }]}>
                <IconButton icon="arrow-left" size={28} onPress={handleGoBack} style={{ margin: 0 }} />
                <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>My Parking Passes</Text>
                    <Text variant="bodySmall" style={{ opacity: 0.6 }}>Manage active passes and entry QR codes</Text>
                </View>
            </View>

            {/* Pill Filter Bar */}
            <View style={styles.pillContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillScroll}>
                    <Chip
                        selected={filterStatus === 'all'}
                        onPress={() => setFilterStatus('all')}
                        style={[styles.filterPill, filterStatus === 'all' && { backgroundColor: theme.colors.primaryContainer }]}
                        textStyle={[styles.pillText, filterStatus === 'all' && { color: theme.colors.onPrimaryContainer, fontWeight: 'bold' }]}
                        showSelectedCheck={false}
                    >
                        All Passes ({bookings.length})
                    </Chip>
                    <Chip
                        selected={filterStatus === 'active'}
                        onPress={() => setFilterStatus('active')}
                        style={[styles.filterPill, filterStatus === 'active' && { backgroundColor: '#00A86B20' }]}
                        textStyle={[styles.pillText, filterStatus === 'active' && { color: '#00A86B', fontWeight: 'bold' }]}
                        showSelectedCheck={false}
                    >
                        Active
                    </Chip>
                    <Chip
                        selected={filterStatus === 'cancelled'}
                        onPress={() => setFilterStatus('cancelled')}
                        style={[styles.filterPill, filterStatus === 'cancelled' && { backgroundColor: '#FF525220' }]}
                        textStyle={[styles.pillText, filterStatus === 'cancelled' && { color: '#FF5252', fontWeight: 'bold' }]}
                        showSelectedCheck={false}
                    >
                        History / Cancelled
                    </Chip>
                </ScrollView>
            </View>

            <FlatList
                data={filteredBookings}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                    const status = (item.booking_status || '').toLowerCase();
                    const isActive = status === 'active' || status === 'booked' || status === 'confirmed';
                    const isThisItemCancelling = cancellingId?.toString() === item.id?.toString();

                    return (
                        <Card style={[styles.ticketCard, { backgroundColor: theme.colors.surface }]} elevation={3}>
                            <Card.Content style={{ padding: 20 }}>
                                {/* Top Row: Zone Name & Pill Status Badge */}
                                <View style={styles.ticketHeader}>
                                    <View style={{ flex: 1, marginRight: 8 }}>
                                        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{item.zone_name}</Text>
                                        <Text variant="bodySmall" style={{ opacity: 0.6, marginTop: 2 }}>Pass ID: #{item.booking_no}</Text>
                                    </View>
                                    <Surface style={[styles.statusPill, { backgroundColor: isActive ? '#00A86B15' : '#FF525215' }]} elevation={0}>
                                        <Text style={[styles.statusPillText, { color: isActive ? '#00A86B' : '#FF5252' }]}>
                                            {isActive ? 'ACTIVE' : 'CANCELLED'}
                                        </Text>
                                    </Surface>
                                </View>

                                <Divider style={{ marginVertical: 14 }} />

                                {/* Slot & Amount Info Grid */}
                                <View style={styles.detailsRow}>
                                    <View style={styles.detailBox}>
                                        <Text variant="bodySmall" style={{ opacity: 0.6 }}>Assigned Slot</Text>
                                        <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.primary, marginTop: 2 }}>
                                            {item.slot_code}
                                        </Text>
                                    </View>
                                    <View style={styles.detailBox}>
                                        <Text variant="bodySmall" style={{ opacity: 0.6 }}>Total Paid</Text>
                                        <Text variant="titleMedium" style={{ fontWeight: 'bold', marginTop: 2 }}>
                                            ₹{item.total_amount}
                                        </Text>
                                    </View>
                                </View>

                                {/* QR Code Display for Active Passes */}
                                {isActive && item.qr_payload && (
                                    <View style={styles.qrContainer}>
                                        <Surface style={styles.qrWrapper} elevation={1}>
                                            <QRCode value={item.qr_payload} size={160} />
                                        </Surface>
                                        <Text variant="bodySmall" style={{ opacity: 0.6, marginTop: 10, textAlign: 'center' }}>
                                            Scan this QR code at the gate barrier
                                        </Text>
                                    </View>
                                )}

                                {/* Action Buttons */}
                                <View style={styles.actionRow}>
                                    <Button 
                                        mode="contained-tonal" 
                                        icon="navigation"
                                        style={{ flex: 1, borderRadius: 14, marginRight: isActive ? 8 : 0 }}
                                        onPress={() => openNativeMaps(item.latitude, item.longitude, item.zone_name)}
                                    >
                                        Directions
                                    </Button>

                                    {isActive && (
                                        <Button 
                                            mode="outlined" 
                                            textColor={theme.colors.error}
                                            style={{ flex: 1, borderColor: theme.colors.error, borderRadius: 14 }}
                                            loading={isThisItemCancelling}
                                            disabled={isPending}
                                            onPress={() => {
                                                setCancellingId(item.id);
                                                cancelBooking(item.id, {
                                                    onSettled: () => setCancellingId(null)
                                                });
                                            }}
                                        >
                                            Cancel Pass
                                        </Button>
                                    )}
                                </View>
                            </Card.Content>
                        </Card>
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { justifyContent: 'center', alignItems: 'center' },
    customHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12 },
    pillContainer: { paddingVertical: 8, paddingHorizontal: 16 },
    pillScroll: { flexDirection: 'row', gap: 8 },
    filterPill: { borderRadius: 20, height: 38 },
    pillText: { fontSize: 13 },
    listContent: { padding: 16, paddingTop: 8 },
    ticketCard: { marginBottom: 20, borderRadius: 24, overflow: 'hidden' },
    ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    statusPill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
    statusPillText: { fontSize: 11, fontWeight: 'bold', letterSpacing: 0.5 },
    detailsRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 16, padding: 14 },
    detailBox: { alignItems: 'flex-start', flex: 1 },
    qrContainer: { alignItems: 'center', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    qrWrapper: { padding: 12, borderRadius: 16, backgroundColor: '#fff' },
    actionRow: { flexDirection: 'row', marginTop: 16, justifyContent: 'space-between' }
});