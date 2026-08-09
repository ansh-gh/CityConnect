import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { Text, Surface, Avatar, Button, Divider, useTheme, ActivityIndicator, Switch, Portal, Dialog, RadioButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useProfile, useDeleteAccount, useLogout } from '../../features/auth/hooks/useAuth';
import { useAppTheme } from '../../context/ThemeContext';

export default function ProfileScreen() {
    const theme = useTheme();
    const router = useRouter();

    const { data: user, isLoading } = useProfile();
    const { mutate: deleteAccount, isPending: isDeleting } = useDeleteAccount();
    const logout = useLogout(); 
    
    // Connect to global Theme Context
    const { themePreference, changeTheme } = useAppTheme();

    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [themeDialogVisible, setThemeDialogVisible] = useState(false);

    if (isLoading) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    // Safely extract user data
    const fullName = user?.full_name || user?.name || 'CityConnect Citizen';
    const email = user?.email || 'user@cityconnect.com';
    const initials = fullName.substring(0, 2).toUpperCase();

    const handleLogout = () => {
        logout(); 
    };

    // Reusable modern row component
    const SettingsRow = ({ icon, title, subtitle, color = theme.colors.primary, onPress, rightControl }) => (
        <TouchableOpacity style={styles.settingsRow} onPress={onPress} activeOpacity={0.7} disabled={!onPress}>
            <View style={[styles.iconWrapper, { backgroundColor: color + '15' }]}>
                <MaterialCommunityIcons name={icon} size={24} color={color} />
            </View>
            <View style={styles.settingsText}>
                <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{title}</Text>
                {subtitle && <Text variant="bodySmall" style={{ opacity: 0.6 }}>{subtitle}</Text>}
            </View>
            {rightControl ? rightControl : (
                onPress && <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} style={{ opacity: 0.5 }} />
            )}
        </TouchableOpacity>
    );

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentContainerStyle={styles.contentContainer}>

            {/* Header Section */}
            <View style={styles.header}>
                <Text variant="headlineMedium" style={styles.headerTitle}>Settings</Text>
            </View>

            {/* Profile Information Card */}
            <Surface style={[styles.profileCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
                <Avatar.Text
                    size={72}
                    label={initials}
                    style={{ backgroundColor: theme.colors.primaryContainer }}
                    color={theme.colors.onPrimaryContainer}
                />
                <View style={styles.profileDetails}>
                    <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>{fullName}</Text>
                    <Text variant="bodyMedium" style={{ opacity: 0.7, marginBottom: 4 }}>{email}</Text>
                </View>
            </Surface>

            {/* Account & Security */}
            <Text variant="titleMedium" style={styles.sectionTitle}>Account & Security</Text>
            <Surface style={[styles.settingsCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
                <SettingsRow
                    icon="account-edit-outline"
                    title="Edit Profile"
                    subtitle="Update your name and phone number"
                    onPress={() => router.push('/edit-profile')}
                />
                <Divider style={styles.divider} />
                <SettingsRow
                    icon="lock-reset"
                    title="Change Password"
                    subtitle="Update your current password"
                    color="#FF9800"
                    onPress={() => router.push('/change-password')}
                />
            </Surface>

            {/* Preferences */}
            <Text variant="titleMedium" style={styles.sectionTitle}>Preferences</Text>
            <Surface style={[styles.settingsCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
                {/* <SettingsRow
                    icon="bell-outline"
                    title="Push Notifications"
                    subtitle="Receive alerts on complaint updates"
                    color="#00A86B"
                    rightControl={<Switch value={notificationsEnabled} onValueChange={() => setNotificationsEnabled(!notificationsEnabled)} />}
                />
                <Divider style={styles.divider} /> */}
                <SettingsRow
                    icon="theme-light-dark"
                    title="App Theme"
                    subtitle={`Current: ${themePreference.charAt(0).toUpperCase() + themePreference.slice(1)}`}
                    color="#9C27B0"
                    onPress={() => setThemeDialogVisible(true)}
                />
            </Surface>

           {/* About & Legal */}
            <Text variant="titleMedium" style={styles.sectionTitle}>About & Legal</Text>
            <Surface style={[styles.settingsCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
                <SettingsRow
                    icon="shield-account-outline"
                    title="Privacy Policy"
                    color="#607D8B"
                    onPress={() => Linking.openURL("https://sites.google.com/view/cityconnect-privacy-policy/home")}
                />
                <Divider style={styles.divider} />
                <SettingsRow
                    icon="file-certificate-outline"
                    title="Terms of Service"
                    color="#607D8B"
                    // Note: If you create a separate page for Terms later, just swap the URL here!
                    onPress={() => Linking.openURL("https://sites.google.com/view/cityconnect-terms-conditions/home")}
                />
            </Surface>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
                <Button
                    mode="contained-tonal"
                    icon="logout"
                    buttonColor={theme.colors.errorContainer}
                    textColor={theme.colors.error}
                    style={styles.actionButton}
                    contentStyle={{ height: 50 }}
                    onPress={handleLogout}
                >
                    Log Out
                </Button>

                <Button
                    mode="text"
                    icon="delete-outline"
                    textColor={theme.colors.error}
                    style={styles.deleteButton}
                    onPress={() => setDeleteDialogVisible(true)}
                >
                    Delete Account
                </Button>
            </View>

            {/* Dialogs */}
            <Portal>
                {/* Theme Selection Dialog */}
                <Dialog visible={themeDialogVisible} onDismiss={() => setThemeDialogVisible(false)} style={{ borderRadius: 20 }}>
                    <Dialog.Title style={{ fontWeight: 'bold' }}>Choose App Theme</Dialog.Title>
                    <Dialog.Content>
                        <RadioButton.Group onValueChange={newValue => changeTheme(newValue)} value={themePreference}>
                            {/* <RadioButton.Item label="System Default" value="system" color={theme.colors.primary} /> */}
                            <RadioButton.Item label="Light Mode" value="light" color={theme.colors.primary} />
                            <RadioButton.Item label="Dark Mode" value="dark" color={theme.colors.primary} />
                        </RadioButton.Group>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setThemeDialogVisible(false)}>Done</Button>
                    </Dialog.Actions>
                </Dialog>

                {/* Delete Account Confirmation Dialog */}
                <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)} style={{ borderRadius: 20 }}>
                    <Dialog.Title style={{ fontWeight: 'bold', color: theme.colors.error }}>Delete Account?</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium">This action is permanent. All your civic data, complaints, and preferences will be permanently erased.</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setDeleteDialogVisible(false)} textColor={theme.colors.onSurfaceVariant}>Cancel</Button>
                        <Button
                            mode="contained"
                            buttonColor={theme.colors.error}
                            onPress={() => {
                                // BUG-03 fix: do NOT close dialog here.
                                // Keep it open so loading spinner is visible.
                                // Close only in onSuccess/onError.
                                deleteAccount(undefined, {
                                    onSuccess: () => setDeleteDialogVisible(false),
                                    onError: () => setDeleteDialogVisible(false),
                                });
                            }}
                            loading={isDeleting}
                            disabled={isDeleting}
                        >
                            Delete
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    contentContainer: { padding: 20, paddingTop: 60, paddingBottom: 110 },
    centered: { justifyContent: 'center', alignItems: 'center' },
    header: { marginBottom: 24 },
    headerTitle: { fontWeight: 'bold' },

    profileCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 24, marginBottom: 32 },
    profileDetails: { marginLeft: 16, flex: 1 },

    sectionTitle: { fontWeight: 'bold', marginBottom: 12, opacity: 0.8, marginLeft: 4, marginTop: 12 },
    settingsCard: { borderRadius: 20, overflow: 'hidden', marginBottom: 16 },
    settingsRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    iconWrapper: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    settingsText: { flex: 1, marginLeft: 16 },
    divider: { marginLeft: 72 },

    buttonContainer: { marginTop: 32, gap: 8 },
    actionButton: { borderRadius: 16 },
    deleteButton: { marginTop: 4 },
});