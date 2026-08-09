import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Linking, Platform, ScrollView } from 'react-native';
import { Text, Card, Searchbar, useTheme, Chip, IconButton, Button, Surface, FAB } from 'react-native-paper';
import { useRouter, Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { useParkingZones } from '../../../features/parking/hooks/useParking';

export default function SmartParkingScreen() {
    const theme = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all'); // 'all' | 'available' | 'full'
    const [userLocation, setUserLocation] = useState(null);

    const { data: parkingZones, isLoading, isError } = useParkingZones();

    useEffect(() => {
        (async () => {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') return;

                let location = await Location.getCurrentPositionAsync({});
                setUserLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                });
            } catch (error) {
                console.error('Error getting location:', error);
            }
        })();
    }, []);

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return null;
        const toRad = (value) => (value * Math.PI) / 180;
        const R = 6371; // Earth radius in km

        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return distance < 1 ? `${(distance * 1000).toFixed(0)} m` : `${distance.toFixed(1)} km`;
    };

    const getAvailabilityColor = (available, total) => {
        if (available === 0) return '#D32F2F';
        if (available / total < 0.2) return '#FF9800';
        return '#00A86B';
    };

    const openNativeMaps = (lat, lng, name) => {
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
            <View style={[styles.container, styles.center, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={{ marginTop: 16 }}>Finding parking zones...</Text>
            </View>
        );
    }

    if (isError) {
        return (
            <View style={[styles.container, styles.center, { backgroundColor: theme.colors.background }]}>
                <Text style={{ color: theme.colors.error }}>Failed to load parking data.</Text>
            </View>
        );
    }

    const filteredZones = parkingZones?.filter(zone => {
        const matchesSearch = zone.name.toLowerCase().includes(searchQuery.toLowerCase());
        const isFull = zone.available_spots === 0;

        if (selectedFilter === 'available') return matchesSearch && !isFull;
        if (selectedFilter === 'full') return matchesSearch && isFull;
        return matchesSearch;
    }) || [];

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header Section */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <View style={styles.titleRow}>
                    <View>
                        <Text variant="headlineMedium" style={styles.title}>Smart Parking</Text>
                        <Text variant="bodySmall" style={{ opacity: 0.6 }}>Find and book verified parking spots</Text>
                    </View>
                </View>

                {/* Modern Clean Searchbar Surface */}
                <Surface style={[styles.searchContainer, { backgroundColor: theme.colors.surface }]} elevation={2}>
                    <MaterialCommunityIcons name="magnify" size={22} color={theme.colors.onSurfaceVariant} style={styles.searchIcon} />
                    <Searchbar
                        placeholder="Search parking zones by name..."
                        onChangeText={setSearchQuery}
                        value={searchQuery}
                        style={styles.searchbarInput}
                        inputStyle={{ minHeight: 0 }}
                        elevation={0}
                        icon={() => null}
                    />
                    {searchQuery.length > 0 && (
                        <IconButton icon="close" size={18} onPress={() => setSearchQuery('')} />
                    )}
                </Surface>

                {/* Quick Filter Chips */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                    <Chip
                        selected={selectedFilter === 'all'}
                        onPress={() => setSelectedFilter('all')}
                        style={[
                            styles.filterChip,
                            selectedFilter === 'all' && { backgroundColor: theme.colors.primaryContainer }
                        ]}
                        textStyle={selectedFilter === 'all' && { color: theme.colors.onPrimaryContainer, fontWeight: 'bold' }}
                        showSelectedCheck={false}
                    >
                        All Zones
                    </Chip>
                    <Chip
                        selected={selectedFilter === 'available'}
                        onPress={() => setSelectedFilter('available')}
                        style={[
                            styles.filterChip,
                            selectedFilter === 'available' && { backgroundColor: '#00A86B20' }
                        ]}
                        textStyle={selectedFilter === 'available' && { color: '#00A86B', fontWeight: 'bold' }}
                        showSelectedCheck={false}
                    >
                        Available Now
                    </Chip>
                    <Chip
                        selected={selectedFilter === 'full'}
                        onPress={() => setSelectedFilter('full')}
                        style={[
                            styles.filterChip,
                            selectedFilter === 'full' && { backgroundColor: '#D32F2F20' }
                        ]}
                        textStyle={selectedFilter === 'full' && { color: '#D32F2F', fontWeight: 'bold' }}
                        showSelectedCheck={false}
                    >
                        Full Lots
                    </Chip>
                </ScrollView>
            </View>

            <FlatList
                data={filteredZones}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={[styles.listContainer, { paddingBottom: insets.bottom + 100 }]}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                    const statusColor = getAvailabilityColor(item.available_spots, item.total_spots);
                    const isFull = item.available_spots === 0;
                    const distance = userLocation
                        ? calculateDistance(userLocation.latitude, userLocation.longitude, item.lat, item.lng)
                        : null;

                    return (
                        <Card
                            style={[styles.card, { backgroundColor: theme.colors.surface }]}
                            elevation={2}
                            onPress={() => router.push(`/(main)/parking/${item.id}`)}
                        >
                            <Card.Content>
                                <View style={styles.cardContent}>
                                    <View style={styles.cardLeft}>
                                        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{item.name}</Text>
                                        <View style={styles.subRow}>
                                            <Text variant="bodyMedium" style={{ fontWeight: '600', color: theme.colors.primary }}>
                                                ₹{item.price_per_hour} <Text variant="bodySmall" style={{ opacity: 0.6 }}>/ hr</Text>
                                            </Text>
                                            {distance && (
                                                <>
                                                    <Text variant="bodyMedium" style={{ opacity: 0.4, marginHorizontal: 6 }}>•</Text>
                                                    <View style={styles.distanceBadge}>
                                                        <MaterialCommunityIcons name="map-marker-distance" size={14} color={theme.colors.onSurfaceVariant} />
                                                        <Text variant="bodySmall" style={{ opacity: 0.7, fontWeight: '500', marginLeft: 2 }}>
                                                            {distance} away
                                                        </Text>
                                                    </View>
                                                </>
                                            )}
                                        </View>
                                    </View>
                                    <View style={styles.cardRight}>
                                        <Chip
                                            icon={isFull ? "close-circle" : "check-circle"}
                                            textStyle={{ color: statusColor, fontWeight: 'bold', fontSize: 12 }}
                                            style={{ backgroundColor: statusColor + '15', height: 32 }}
                                        >
                                            {isFull ? 'FULL' : `${item.available_spots} Spots`}
                                        </Chip>
                                    </View>
                                </View>

                                <View style={styles.cardFooter}>
                                    <Button
                                        mode="contained-tonal"
                                        icon="navigation"
                                        compact
                                        style={{ borderRadius: 10 }}
                                        onPress={() => openNativeMaps(item.lat, item.lng, item.name)}
                                    >
                                        Get Directions
                                    </Button>
                                </View>
                            </Card.Content>
                        </Card>
                    );
                }}
            />
            {/* Floating Action Button for My Bookings */}
            <FAB
                icon="ticket-confirmation-outline"
                label="My Bookings"
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                color="#ffffff"
                onPress={() => router.push('/(main)/parking/my-bookings')}
                mode="elevated"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { justifyContent: 'center', alignItems: 'center' },
    header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, zIndex: 1 },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    title: { fontWeight: 'bold' },
    searchContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, paddingHorizontal: 12, marginBottom: 12 },
    searchIcon: { marginRight: 4 },
    searchbarInput: { flex: 1, backgroundColor: 'transparent', height: 48 },
    filterScroll: { flexDirection: 'row', marginBottom: 8 },
    filterChip: { marginRight: 8, borderRadius: 12 },
    listContainer: { padding: 16 },
    card: { marginBottom: 16, borderRadius: 20 },
    cardContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardLeft: { flex: 1, marginRight: 16 },
    cardRight: { alignItems: 'flex-end' },
    subRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    distanceBadge: { flexDirection: 'row', alignItems: 'center' },
    cardFooter: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 14, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 12 },
    fab: { 
        position: 'absolute', 
        right: 16, 
        bottom: 90, 
        elevation: 6,
        borderRadius: 18
    },
});