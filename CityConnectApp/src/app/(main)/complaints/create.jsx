import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, useTheme, Menu, ActivityIndicator, Surface, IconButton } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useCreateComplaint } from '../../../features/complaints/hooks/useComplaints';

const VALID_CATEGORIES = [
    { label: 'Road', value: 'road', icon: 'road-variant' },
    { label: 'Garbage', value: 'garbage', icon: 'trash-can-outline' },
    { label: 'Street Light', value: 'street_light', icon: 'lightbulb-outline' },
    { label: 'Water Supply', value: 'water_supply', icon: 'water-outline' },
    { label: 'Drainage', value: 'drainage', icon: 'pipe' },
    { label: 'Public Property', value: 'public_property', icon: 'bank-outline' },
    { label: 'Other', value: 'other', icon: 'dots-horizontal' },
];

export default function CreateComplaintScreen() {
    const theme = useTheme();
    const router = useRouter();
    const { mutate: createComplaint, isPending } = useCreateComplaint();
    const [images, setImages] = useState([]);
    const [menuVisible, setMenuVisible] = useState(false);
    const [isLocating, setIsLocating] = useState(true);
    const [locationFailed, setLocationFailed] = useState(false);
    const [coords, setCoords] = useState({ latitude: null, longitude: null });

    const { control, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
        defaultValues: { title: '', category: '', description: '', address: '' }
    });

    const selectedCategory = watch('category');

    useEffect(() => {
        (async () => {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setIsLocating(false);
                    setLocationFailed(true); // BUG-13 fix: allow manual input when permission denied
                    return;
                }

                let location = await Location.getCurrentPositionAsync({});
                const { latitude, longitude } = location.coords;
                setCoords({ latitude, longitude });

                let reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });

                if (reverseGeocode && reverseGeocode.length > 0) {
                    const place = reverseGeocode[0];
                    const formattedAddress = [place.name, place.street, place.subregion, place.city]
                        .filter(Boolean)
                        .join(', ');
                    setValue('address', formattedAddress || `${latitude}, ${longitude}`);
                } else {
                    setValue('address', `${latitude}, ${longitude}`);
                }
            } catch (error) {
                console.error('Error fetching location:', error);
                // BUG-13 fix: mark location as failed so user can type address manually
                setLocationFailed(true);
            } finally {
                setIsLocating(false);
            }
        })();
    }, [setValue]);

    const takePhoto = async () => {
        if (images.length >= 3) {
            alert('You can upload a maximum of 3 images.');
            return;
        }

        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissionResult.granted) {
            alert('Camera permission is required to capture issue photos.');
            return;
        }

        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.7,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImages([...images, result.assets[0]]);
        }
    };

    const removeImage = (indexToRemove) => {
        setImages(images.filter((_, index) => index !== indexToRemove));
    };

    const onSubmit = (data) => {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('category', data.category);
        formData.append('description', data.description);
        formData.append('address', data.address);
        
        if (coords.latitude) formData.append('latitude', coords.latitude);
        if (coords.longitude) formData.append('longitude', coords.longitude);

        images.forEach((img, index) => {
            let filename = img.uri.split('/').pop();
            if (!filename || !filename.includes('.')) {
                filename = `complaint_${index}.jpg`;
            }

            formData.append('images', {
                uri: Platform.OS === 'ios' ? img.uri.replace('file://', '') : img.uri,
                name: filename,
                type: 'image/jpeg',
            });
        });

        createComplaint(formData, {
            onSuccess: () => {
                reset();
                setImages([]);
                router.replace('/(main)/complaints');
            }
        });
    };

    const getCategoryLabel = (val) => {
        const found = VALID_CATEGORIES.find(c => c.value === val);
        return found ? found.label : 'Select Category';
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView 
                style={{ backgroundColor: theme.colors.background }} 
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Surface style={[styles.formCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.iconWrapper, { backgroundColor: theme.colors.primary + '15' }]}>
                            <MaterialCommunityIcons name="clipboard-alert-outline" size={28} color={theme.colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>New Report</Text>
                            <Text variant="bodySmall" style={{ opacity: 0.6 }}>Provide issue details below</Text>
                        </View>
                    </View>

                    <Controller control={control} name="title" rules={{ required: 'Title is required' }} render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput 
                            label="Issue Title" 
                            mode="outlined" 
                            onBlur={onBlur} 
                            onChangeText={onChange} 
                            value={value} 
                            error={!!errors.title} 
                            style={styles.input} 
                            outlineColor={theme.colors.outlineVariant}
                        />
                    )}/>
                    {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}

                    <View style={styles.input}>
                        <Menu
                            visible={menuVisible}
                            onDismiss={() => setMenuVisible(false)}
                            anchor={
                                <Button 
                                    mode="outlined" 
                                    onPress={() => setMenuVisible(true)} 
                                    contentStyle={styles.menuAnchorContent} 
                                    style={[styles.menuButton, { borderColor: errors.category ? theme.colors.error : theme.colors.outlineVariant }]}
                                    icon="chevron-down"
                                >
                                    {getCategoryLabel(selectedCategory)}
                                </Button>
                            }
                        >
                            {VALID_CATEGORIES.map((cat) => (
                                <Menu.Item 
                                    key={cat.value} 
                                    onPress={() => {
                                        setValue('category', cat.value, { shouldValidate: true });
                                        setMenuVisible(false);
                                    }} 
                                    title={cat.label} 
                                    leadingIcon={cat.icon}
                                />
                            ))}
                        </Menu>
                    </View>
                    <Controller control={control} name="category" rules={{ required: 'Category is required' }} render={() => null} />
                    {errors.category && <Text style={styles.errorText}>{errors.category.message}</Text>}

                    <View style={styles.locationContainer}>
                        <Controller control={control} name="address" rules={{ required: 'Address is required' }} render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput 
                                label="Auto-detected Location" 
                                mode="outlined" 
                                onBlur={onBlur} 
                                onChangeText={onChange} 
                                value={value} 
                                // BUG-13 fix: only disable while actively fetching location, allow manual edit after
                                disabled={isLocating}
                                placeholder={locationFailed ? 'Enter address manually' : ''}
                                error={!!errors.address} 
                                style={[styles.input, { flex: 1 }]} 
                                outlineColor={theme.colors.outlineVariant}
                            />
                        )}/>
                        {isLocating && <ActivityIndicator animating={true} size="small" style={styles.locationLoader} color={theme.colors.primary} />}
                    </View>
                    {errors.address && <Text style={styles.errorText}>{errors.address.message}</Text>}

                    <Controller control={control} name="description" rules={{ required: 'Description is required' }} render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput 
                            label="Detailed Description" 
                            mode="outlined" 
                            multiline 
                            numberOfLines={4} 
                            onBlur={onBlur} 
                            onChangeText={onChange} 
                            value={value} 
                            error={!!errors.description} 
                            style={styles.input} 
                            outlineColor={theme.colors.outlineVariant}
                        />
                    )}/>
                    {errors.description && <Text style={styles.errorText}>{errors.description.message}</Text>}

                    <Text variant="titleSmall" style={{ fontWeight: 'bold', marginTop: 8, marginBottom: 8 }}>
                        Photographic Proof ({images.length}/3)
                    </Text>
                    
                    <Button 
                        mode="contained-tonal" 
                        icon="camera" 
                        onPress={takePhoto} 
                        style={styles.imageButton}
                        contentStyle={{ height: 48 }}
                    >
                        Capture Photo via Camera
                    </Button>

                    <View style={styles.imagePreviewContainer}>
                        {images.map((img, index) => (
                            <View key={index} style={styles.previewWrapper}>
                                <Image source={{ uri: img.uri }} style={styles.previewImage} />
                                <IconButton 
                                    icon="close-circle" 
                                    iconColor={theme.colors.error} 
                                    size={22} 
                                    style={styles.removeImageBtn}
                                    onPress={() => removeImage(index)}
                                />
                            </View>
                        ))}
                    </View>

                    <Button 
                        mode="contained" 
                        onPress={handleSubmit(onSubmit)} 
                        loading={isPending} 
                        disabled={isPending} 
                        style={styles.submitButton}
                        contentStyle={{ height: 52 }}
                        labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
                    >
                        Submit Report
                    </Button>
                </Surface>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 16, paddingTop: 16, paddingBottom: 110 },
    formCard: { borderRadius: 24, padding: 20 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 },
    iconWrapper: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    input: { marginBottom: 12, backgroundColor: 'transparent' },
    locationContainer: { flexDirection: 'row', alignItems: 'center' },
    locationLoader: { position: 'absolute', right: 16, top: 18 },
    menuButton: { justifyContent: 'center', borderRadius: 12, height: 56, borderWidth: 1, backgroundColor: 'transparent' },
    menuAnchorContent: { height: 56, justifyContent: 'space-between', flexDirection: 'row-reverse' },
    errorText: { color: '#D32F2F', fontSize: 12, marginTop: -8, marginBottom: 12, marginLeft: 4 },
    imageButton: { marginBottom: 16, borderRadius: 12 },
    imagePreviewContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
    previewWrapper: { position: 'relative' },
    previewImage: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#e0e0e0' },
    removeImageBtn: { position: 'absolute', top: -10, right: -10, backgroundColor: '#fff', margin: 0 },
    submitButton: { marginTop: 8, borderRadius: 16 },
});