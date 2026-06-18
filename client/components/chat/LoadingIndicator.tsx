import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

interface LoadingIndicatorProps {
    surfaceBg: string;
    primaryColor: string;
    textMutedColor: string;
}

export const LoadingIndicator = React.memo(({ surfaceBg, primaryColor, textMutedColor }: LoadingIndicatorProps) => {
    const dot1 = useRef(new Animated.Value(1)).current;
    const dot2 = useRef(new Animated.Value(0.6)).current;
    const dot3 = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.parallel([
                    Animated.timing(dot1, { toValue: 0.3, duration: 400, useNativeDriver: false }),
                    Animated.timing(dot2, { toValue: 1, duration: 400, useNativeDriver: false }),
                    Animated.timing(dot3, { toValue: 0.6, duration: 400, useNativeDriver: false }),
                ]),
                Animated.parallel([
                    Animated.timing(dot1, { toValue: 0.6, duration: 400, useNativeDriver: false }),
                    Animated.timing(dot2, { toValue: 0.3, duration: 400, useNativeDriver: false }),
                    Animated.timing(dot3, { toValue: 1, duration: 400, useNativeDriver: false }),
                ]),
                Animated.parallel([
                    Animated.timing(dot1, { toValue: 1, duration: 400, useNativeDriver: false }),
                    Animated.timing(dot2, { toValue: 0.6, duration: 400, useNativeDriver: false }),
                    Animated.timing(dot3, { toValue: 0.3, duration: 400, useNativeDriver: false }),
                ]),
            ])
        );

        animation.start();

        return () => animation.stop();
    }, [dot1, dot2, dot3]);

    return (
        <View style={[styles.loadingContainer, { backgroundColor: surfaceBg }]}>
            <View style={styles.typingDots}>
                <Animated.View style={[styles.dot, { backgroundColor: primaryColor, opacity: dot1 }]} />
                <Animated.View style={[styles.dot, { backgroundColor: primaryColor, opacity: dot2 }]} />
                <Animated.View style={[styles.dot, { backgroundColor: primaryColor, opacity: dot3 }]} />
            </View>
            <Text style={[styles.loadingText, { color: textMutedColor }]}>
                AI жавоб тайёрламоқда...
            </Text>
        </View>
    );
});

LoadingIndicator.displayName = 'LoadingIndicator';

const styles = StyleSheet.create({
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginHorizontal: 16,
        marginBottom: 8,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    typingDots: {
        flexDirection: 'row',
        gap: 4,
        alignItems: 'center',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    loadingText: {
        fontSize: 13,
        fontWeight: '500',
    },
});
