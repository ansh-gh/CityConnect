import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Chip, useTheme, ActivityIndicator, Divider, Button, Surface, IconButton } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useComplaintDetail, useComplaintHistory, useDeleteComplaint } from '../../../features/complaints/hooks/useComplaints';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ComplaintDetailScreen() {
    const theme = useTheme();
    const router = useRouter();
    const { id } = useLocalSearchParams();

    // Modal state for full-screen image preview
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImageUri, setSelectedImageUri] = useState(null);

    // Data Hooks
    const { data: complaint, isLoading: isDetailLoading, isError: isDetailError } = useComplaintDetail(id);
    const { data: history = [], isLoading: isHistoryLoading } = useComplaintHistory(id);
    const { mutate: deleteComplaint, isPending: isDeleting } = useDeleteComplaint();

    if (isDetailLoading) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (isDetailError || !complaint) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
                <MaterialCommunityIcons name="alert-circle-outline" size={48} color={theme.colors.error} />
                <Text variant="titleMedium" style={{ marginTop: 12 }}>Complaint not found</Text>
                <Button mode="text" onPress={() => router.back()} style={{ marginTop: 8 }}>Go Back</Button>
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

    const formatCategory = (cat) => {
        if (!cat || typeof cat !== 'string') return 'General';
        return cat.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

   const handleDelete = () => {
        Alert.alert(
            'Delete Complaint',
            'Are you sure you want to delete this complaint? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteComplaint(id, { 
                        onSuccess: () => router.back(),
                        onError: (error) => {
                            const errorMessage = error?.response?.data?.message || 'Failed to delete complaint';
                            Alert.alert('Action Denied', errorMessage);
                        }
                    })
                }
            ]
        );
    };
    
    const statusConfig = getStatusConfig(complaint.status);

    const openImageModal = (imgUrl) => {
        setSelectedImageUri(imgUrl);
        setModalVisible(true);
    };

    const closeImageModal = () => {
        setSelectedImageUri(null);
        setModalVisible(false);
    };

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            {/* UNIFIED SINGLE CARD */}
            <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>

                {/* Header Info */}
                <View style={styles.cardHeader}>
                    <View style={{ flex: 1, paddingRight: 12 }}>
                        <Text variant="labelMedium" style={styles.ticket}>
                            Ticket #{complaint.ticket_no || complaint.id}
                        </Text>
                        <Text variant="titleLarge" style={styles.title}>{complaint.title}</Text>
                    </View>
                    <View style={[styles.iconWrapper, { backgroundColor: theme.colors.primary + '15' }]}>
                        <MaterialCommunityIcons name="clipboard-text-outline" size={24} color={theme.colors.primary} />
                    </View>
                </View>
                <Text variant="bodySmall" style={styles.date}>
                    Filed on: {new Date(complaint.created_at || Date.now()).toLocaleString()}
                </Text>

                {/* Tags */}
                <View style={styles.chipRow}>
                    <Chip textStyle={{ fontSize: 12 }} style={{ backgroundColor: theme.colors.surfaceVariant, marginRight: 8 }}>
                        {formatCategory(complaint.category)}
                    </Chip>
                    <Chip
                        icon={statusConfig.icon}
                        textStyle={{ color: statusConfig.color, fontSize: 12, fontWeight: 'bold' }}
                        style={{ backgroundColor: statusConfig.color + '15' }}
                    >
                        {complaint.status || 'Pending'}
                    </Chip>
                </View>

                <Divider style={styles.divider} />

                {/* Location & Description */}
                <View style={styles.textSection}>
                    <MaterialCommunityIcons name="map-marker-outline" size={20} color={theme.colors.primary} style={{ marginRight: 8, marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                        <Text variant="titleSmall" style={styles.sectionTitle}>Location</Text>
                        <Text variant="bodyMedium" style={styles.textBlock}>{complaint.address || 'Location not specified'}</Text>
                    </View>
                </View>

                <View style={[styles.textSection, { marginTop: 16 }]}>
                    <MaterialCommunityIcons name="text-box-outline" size={20} color={theme.colors.primary} style={{ marginRight: 8, marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                        <Text variant="titleSmall" style={styles.sectionTitle}>Description</Text>
                        <Text variant="bodyMedium" style={styles.textBlock}>{complaint.description}</Text>
                    </View>
                </View>

                {/* Attached Photos (Clickable) */}
                {Array.isArray(complaint.images) && complaint.images.length > 0 && (
                    <View style={{ marginTop: 20 }}>
                        <Text variant="titleSmall" style={[styles.sectionTitle, { marginBottom: 8, marginLeft: 28 }]}>Attached Photos</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                            {complaint.images.map((imgUrl, index) => (
                                <TouchableOpacity key={index} activeOpacity={0.8} onPress={() => openImageModal(imgUrl)}>
                                    <Image source={{ uri: imgUrl }} style={styles.attachmentImage} />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                <Divider style={styles.divider} />

                {/* Status Tracker */}
                <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 20 }}>Status History</Text>

                {isHistoryLoading ? (
                    <ActivityIndicator size="small" style={{ marginVertical: 20 }} />
                ) : (!Array.isArray(history) || history.length === 0) ? (
                    <Text variant="bodyMedium" style={{ opacity: 0.5, textAlign: 'center', marginVertical: 10 }}>
                        No status updates yet.
                    </Text>
                ) : (
                    <View style={styles.timelineContainer}>
                        {history.map((item, index) => {
                            const isLast = index === history.length - 1;
                            const itemConfig = getStatusConfig(item.status);

                            return (
                                <View key={index} style={styles.timelineStep}>
                                    <View style={styles.timelineNodeContainer}>
                                        <View style={[styles.timelineNode, { backgroundColor: itemConfig.color }]} />
                                        {!isLast && <View style={[styles.timelineLine, { backgroundColor: theme.colors.surfaceVariant }]} />}
                                    </View>
                                    <View style={styles.timelineContent}>
                                        <View style={styles.historyRow}>
                                            <Text variant="titleSmall" style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                                                {item.status}
                                            </Text>
                                            <Text variant="bodySmall" style={{ opacity: 0.5 }}>
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </Text>
                                        </View>
                                        {item.remarks ? (
                                            <Text variant="bodyMedium" style={{ opacity: 0.7, marginTop: 4 }}>
                                                {item.remarks}
                                            </Text>
                                        ) : null}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* Action Buttons Integrated at the Bottom */}
                <View style={styles.actionContainer}>
                    {complaint.status?.toLowerCase() === 'resolved' && (
                        <Button
                            mode="contained"
                            buttonColor="#00A86B"
                            icon="star-shooting"
                            style={styles.actionBtn}
                            contentStyle={{ height: 50 }}
                            labelStyle={{ fontSize: 15, fontWeight: 'bold' }}
                            onPress={() => router.push({
                                pathname: '/(main)/feedback',
                                params: { complaintId: complaint.id }
                            })}
                        >
                            Rate Resolution
                        </Button>
                    )}

                    <Button
                        mode={complaint.status?.toLowerCase() === 'resolved' ? "outlined" : "contained-tonal"}
                        icon="delete-outline"
                        textColor={theme.colors.error}
                        buttonColor={complaint.status?.toLowerCase() === 'resolved' ? 'transparent' : theme.colors.errorContainer}
                        style={styles.deleteButton}
                        contentStyle={{ height: 48 }}
                        onPress={handleDelete}
                        loading={isDeleting}
                        disabled={isDeleting}
                    >
                        Delete Complaint
                    </Button>
                </View>
            </Surface>

            {/* FULL SCREEN IMAGE PREVIEW MODAL */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={closeImageModal}
            >
                <View style={styles.modalContainer}>
                    <TouchableOpacity style={styles.modalCloseButton} onPress={closeImageModal}>
                        <IconButton icon="close" iconColor="#ffffff" size={28} />
                    </TouchableOpacity>
                    {selectedImageUri && (
                        <Image 
                            source={{ uri: selectedImageUri }} 
                            style={styles.fullScreenImage} 
                            resizeMode="contain" 
                        />
                    )}
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { justifyContent: 'center', alignItems: 'center' },

    content: { padding: 16, paddingTop: 16, paddingBottom: 110 },

    card: { borderRadius: 24, padding: 20 },

    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    iconWrapper: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },

    title: { fontWeight: 'bold', lineHeight: 26 },
    ticket: { opacity: 0.6, marginBottom: 4, fontWeight: 'bold', fontSize: 13 },
    date: { opacity: 0.5, marginBottom: 16, fontSize: 12 },

    chipRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
    divider: { marginVertical: 24 },

    textSection: { flexDirection: 'row', alignItems: 'flex-start' },
    sectionTitle: { fontWeight: 'bold', marginBottom: 4 },
    textBlock: { opacity: 0.8, lineHeight: 22 },

    imageScroll: { flexDirection: 'row', marginLeft: 28 },
    attachmentImage: { width: 100, height: 100, borderRadius: 12, marginRight: 12, backgroundColor: '#e0e0e0' },

    timelineContainer: { marginTop: 4, marginBottom: 24 },
    timelineStep: { flexDirection: 'row' },
    timelineNodeContainer: { alignItems: 'center', width: 24, marginRight: 12 },
    timelineNode: { width: 14, height: 14, borderRadius: 7, zIndex: 2 },
    timelineLine: { width: 2, flex: 1, marginTop: -2, marginBottom: -2 },
    timelineContent: { flex: 1, paddingBottom: 24, marginTop: -4 },
    historyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

    actionContainer: { gap: 12 },
    actionBtn: { borderRadius: 16 },
    deleteButton: { borderRadius: 16, borderWidth: 0 },

    // Modal Styles for Full-Screen Preview
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCloseButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
    },
    fullScreenImage: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT * 0.8,
    },
});