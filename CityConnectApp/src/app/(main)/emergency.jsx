import React from 'react';
import { View, StyleSheet, ScrollView, Linking, TouchableOpacity, Alert } from 'react-native';
import { Text, Surface, Button, useTheme, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

const EMERGENCY_CONTACTS = [
    { id: 1, name: 'National Emergency', number: '112', icon: 'shield-alert' },
    { id: 2, name: 'Police', number: '100', icon: 'police-badge' },
    { id: 3, name: 'Fire Brigade', number: '101', icon: 'fire-truck' },
    { id: 4, name: 'Ambulance', number: '102', icon: 'ambulance' },
    { id: 5, name: 'Women Helpline', number: '1091', icon: 'human-female' },
    { id: 6, name: 'Disaster Management', number: '108', icon: 'alert-decagram' }
];

export default function EmergencyScreen() {
    const theme = useTheme();

    const handleCall = async (number) => {
        const cleanNumber = number ? number.replace(/[^\d+]/g, '') : '';
        const url = `tel:${cleanNumber}`;

        try {
            // Bypass canOpenURL (which fails on Android 11+ due to package visibility rules)
            // Directly attempt to open the dialer app.
            await Linking.openURL(url);
        } catch (err) {
            // If the device physically cannot handle calls (e.g., Emulators, Wi-Fi Tablets), it will throw an error and land here.
            console.warn('Call failed to open, triggering fallback:', err);
            
            Alert.alert(
                'Call Not Supported',
                `This device cannot make phone calls. Would you like to copy the number (${number}) to your clipboard?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                        text: 'Copy Number', 
                        onPress: async () => {
                            await Clipboard.setStringAsync(number);
                            Alert.alert('Success', 'Phone number copied to clipboard!');
                        } 
                    }
                ]
            );
        }
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text variant="headlineMedium" style={styles.headerTitle}>Emergency</Text>
                <Text variant="bodyMedium" style={{ opacity: 0.6 }}>Immediate assistance</Text>
            </View>

            <Surface style={[styles.sosCard, { backgroundColor: theme.colors.error }]} elevation={5}>
                <View style={styles.sosContent}>
                    <View style={styles.sosRipple}>
                        <MaterialCommunityIcons name="alert-octagon" size={56} color={theme.colors.onError} />
                    </View>
                    <Text variant="headlineSmall" style={[styles.sosTitle, { color: theme.colors.onError }]}>SOS PANIC BUTTON</Text>
                    <Text variant="bodyMedium" style={[styles.sosDesc, { color: theme.colors.onError }]}>
                        Tap to immediately dial the National Emergency Helpline (112).
                    </Text>
                    <Button 
                        mode="elevated" 
                        buttonColor={theme.colors.onError}
                        textColor={theme.colors.error}
                        onPress={() => handleCall('112')}
                        style={styles.sosBtn}
                        contentStyle={{ height: 56 }}
                        labelStyle={{ fontSize: 16, fontWeight: '900', letterSpacing: 1 }}
                        icon="phone-alert"
                    >
                        DIAL 112 NOW
                    </Button>
                </View>
            </Surface>

            <Text variant="titleLarge" style={styles.sectionTitle}>Quick Dial</Text>

            {EMERGENCY_CONTACTS.map((contact) => (
                <Surface key={contact.id} style={[styles.contactCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
                    <TouchableOpacity style={styles.contactRow} onPress={() => handleCall(contact.number)} activeOpacity={0.6}>
                        <View style={[styles.iconWrapper, { backgroundColor: theme.colors.primary + '15' }]}>
                            <MaterialCommunityIcons name={contact.icon} size={26} color={theme.colors.primary} />
                        </View>
                        <View style={styles.contactText}>
                            <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{contact.name}</Text>
                            <Text variant="bodyMedium" style={{ opacity: 0.7, marginTop: 2 }}>{contact.number}</Text>
                        </View>
                        <IconButton icon="phone" mode="contained-tonal" size={24} iconColor={theme.colors.primary} />
                    </TouchableOpacity>
                </Surface>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20, paddingTop: 60, paddingBottom: 110 },
    header: { marginBottom: 24 },
    headerTitle: { fontWeight: 'bold', color: '#D32F2F' },
    sosCard: { borderRadius: 28, marginBottom: 32, padding: 24, alignItems: 'center' },
    sosContent: { alignItems: 'center', width: '100%' },
    sosRipple: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 16, borderRadius: 50, marginBottom: 12 },
    sosTitle: { fontWeight: '900', marginBottom: 8, letterSpacing: 0.5 },
    sosDesc: { textAlign: 'center', opacity: 0.9, marginBottom: 24 },
    sosBtn: { width: '100%', borderRadius: 16 },
    sectionTitle: { fontWeight: 'bold', marginBottom: 16, opacity: 0.9 },
    contactCard: { borderRadius: 16, marginBottom: 12, overflow: 'hidden' },
    contactRow: { flexDirection: 'row', alignItems: 'center', padding: 12 },
    iconWrapper: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    contactText: { flex: 1, marginLeft: 16 }
});