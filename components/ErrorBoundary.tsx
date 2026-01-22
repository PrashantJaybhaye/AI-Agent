import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ActivityIndicator, DevSettings, Platform, StyleSheet, Text, View } from 'react-native';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    isReloading: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            isReloading: false
        };
    }

    static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI
        return {
            hasError: true,
            error,
            isReloading: false
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error details
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // Check if it's a navigation or linking error
        const isNavigationError =
            error.message?.includes('Attempted to navigate before mounting') ||
            error.message?.includes('configured linking in multiple places') ||
            error.message?.includes('navigation');

        if (isNavigationError) {
            // Auto-reload after a short delay for navigation errors
            this.setState({ isReloading: true });

            setTimeout(() => {
                try {
                    // In development, use DevSettings to reload
                    if (__DEV__ && Platform.OS !== 'web') {
                        DevSettings.reload();
                    } else {
                        // In production, reset error state to retry
                        this.setState({ hasError: false, error: null, isReloading: false });
                    }
                } catch (reloadError) {
                    console.error('Failed to reload:', reloadError);
                    // Reset state to allow retry
                    this.setState({ hasError: false, error: null, isReloading: false });
                }
            }, 1500);
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <View style={styles.content}>
                        <ActivityIndicator size="large" color="#000000" />
                        <Text style={styles.title}>
                            {this.state.isReloading ? 'Restarting...' : 'Recovering...'}
                        </Text>
                        <Text style={styles.message}>
                            {this.state.isReloading
                                ? 'The app is restarting automatically'
                                : 'Attempting to recover...'}
                        </Text>
                    </View>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9ECDB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        gap: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#000000',
        marginTop: 16,
    },
    message: {
        fontSize: 14,
        color: '#666666',
        textAlign: 'center',
    },
});
