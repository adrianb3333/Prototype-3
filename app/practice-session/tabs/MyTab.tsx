import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '@/constants/colors';
import { useSession } from '@/contexts/SessionContext';

export default function MyTab() {
  const { quitSession } = useSession();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>GOLF</Text>
      <TouchableOpacity style={styles.quitButton} onPress={quitSession}>
        <Text style={styles.quitText}>Quit Practice</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 40,
  },
  quitButton: {
    backgroundColor: Colors.error,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  quitText: {
    color: Colors.textLight,
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
