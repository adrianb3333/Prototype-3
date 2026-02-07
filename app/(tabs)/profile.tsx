import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Settings } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.headerRow}>
          <View style={styles.spacer} />
          <TouchableOpacity
            onPress={() => router.push('/settings/settings1')}
            style={styles.settingsButton}
            testID="settings-button"
          >
            <Settings size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      {/* You can add your new content here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  safeArea: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row' as const,
    justifyContent: 'flex-end' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  spacer: {
    flex: 1,
  },
  settingsButton: {
    padding: 8,
  },
});