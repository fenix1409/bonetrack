import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Modal, Animated, Pressable, useColorScheme } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Colors from '@/constants/Colors';
import { Button } from './Button';

interface SuccessModalProps {
    visible: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
}

export function SuccessModal({ 
    visible, 
    onClose, 
    title = 'Сақланди', 
    message = 'Маълумотлар муваффақиятли сақланди!' 
}: SuccessModalProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const c = Colors[colorScheme];
    
    const scale = React.useRef(new Animated.Value(0)).current;
    const opacity = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scale, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 50,
                    friction: 7
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true
                })
            ]).start();
        } else {
            scale.setValue(0);
            opacity.setValue(0);
        }
    }, [visible]);

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <Animated.View 
                    style={[
                        styles.content, 
                        { 
                            backgroundColor: c.card,
                            opacity,
                            transform: [{ scale }]
                        }
                    ]}
                >
                    <View style={[styles.iconContainer, { backgroundColor: c.excellentBg }]}>
                        <MaterialCommunityIcons name="check-circle" size={60} color={c.excellent} />
                    </View>
                    
                    <Text style={[styles.title, { color: c.text }]}>{title}</Text>
                    <Text style={[styles.message, { color: c.textMuted }]}>{message}</Text>
                    
                    <Button 
                        title="Ёпиш" 
                        onPress={onClose} 
                        style={styles.button}
                        size="large"
                    />
                </Animated.View>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    content: {
        width: '100%',
        maxWidth: 340,
        borderRadius: 32,
        padding: 32,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center',
        marginBottom: 32,
        fontWeight: '500',
    },
    button: {
        width: '100%',
    },
});
