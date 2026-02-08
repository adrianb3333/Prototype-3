import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
  Platform,
  Animated,
  Image,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Settings, Camera, X, UserCheck, UserPlus } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useProfile, UserProfile } from '@/contexts/ProfileContext';

export default function ProfileScreen() {
  const router = useRouter();
  const {
    profile,
    isLoading,
    followers,
    following,
    followersCount,
    followingCount,
    updateProfile,
    isUpdating,
    uploadAvatar,
    toggleFollow,
    isTogglingFollow,
    isFollowing,
  } = useProfile();

  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [followsModalVisible, setFollowsModalVisible] = useState<boolean>(false);
  const [followsTab, setFollowsTab] = useState<'followers' | 'following'>('followers');
  const [editUsername, setEditUsername] = useState<string>('');
  const [editDisplayName, setEditDisplayName] = useState<string>('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState<boolean>(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const openEditModal = useCallback(() => {
    console.log('[Profile] Opening edit modal');
    setEditUsername(profile?.username ?? '');
    setEditDisplayName(profile?.display_name ?? '');
    setEditModalVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [profile]);

  const handleSaveProfile = useCallback(async () => {
    console.log('[Profile] Saving profile:', editUsername, editDisplayName);
    try {
      await updateProfile({
        username: editUsername.trim(),
        display_name: editDisplayName.trim(),
      });
      setEditModalVisible(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      console.error('[Profile] Save error:', err.message);
      Alert.alert('Fel', 'Kunde inte spara profilen. Försök igen.');
    }
  }, [editUsername, editDisplayName, updateProfile]);

  const handlePickAvatar = useCallback(async () => {
    console.log('[Profile] Picking avatar');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Behörighet krävs', 'Vi behöver åtkomst till ditt bildbibliotek.');
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setIsUploadingAvatar(true);
      try {
        await uploadAvatar(result.assets[0].uri);
        console.log('[Profile] Avatar uploaded successfully');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (err: any) {
        console.error('[Profile] Avatar upload error:', err.message);
        Alert.alert('Fel', 'Kunde inte ladda upp bilden. Försök igen.');
      } finally {
        setIsUploadingAvatar(false);
      }
    }
  }, [uploadAvatar]);

  const openFollowsModal = useCallback((tab: 'followers' | 'following') => {
    console.log('[Profile] Opening follows modal, tab:', tab);
    setFollowsTab(tab);
    setFollowsModalVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleToggleFollow = useCallback(async (targetUserId: string) => {
    console.log('[Profile] Toggle follow:', targetUserId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await toggleFollow(targetUserId);
    } catch (err: any) {
      console.error('[Profile] Toggle follow error:', err.message);
    }
  }, [toggleFollow]);

  const renderFollowUser = useCallback(({ item }: { item: UserProfile }) => {
    const amFollowing = isFollowing(item.id);
    return (
      <View style={styles.followUserRow}>
        <View style={styles.followUserLeft}>
          {item.avatar_url ? (
            <Image source={{ uri: item.avatar_url }} style={styles.followUserAvatar} />
          ) : (
            <View style={styles.followUserAvatarPlaceholder}>
              <Text style={styles.followUserAvatarText}>
                {(item.display_name || item.username || '?')[0].toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.followUserInfo}>
            <Text style={styles.followUserName} numberOfLines={1}>{item.display_name}</Text>
            <Text style={styles.followUserUsername} numberOfLines={1}>@{item.username}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.followBtn, amFollowing && styles.followBtnActive]}
          onPress={() => handleToggleFollow(item.id)}
          disabled={isTogglingFollow}
          activeOpacity={0.7}
        >
          {amFollowing ? (
            <UserCheck size={14} color="#fff" />
          ) : (
            <UserPlus size={14} color="#fff" />
          )}
          <Text style={styles.followBtnText}>
            {amFollowing ? 'Följer' : 'Följ'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }, [isFollowing, handleToggleFollow, isTogglingFollow]);

  const initials = (profile?.display_name || profile?.username || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1DB954" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.headerRow}>
          <Text style={styles.headerUsername}>@{profile?.username ?? 'user'}</Text>
          <TouchableOpacity
            onPress={() => router.push('/settings/settings1')}
            style={styles.settingsButton}
            testID="settings-button"
          >
            <Settings size={22} color="#B0B0B0" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.profileSection}>
          <View style={styles.profileRow}>
            <TouchableOpacity
              onPress={handlePickAvatar}
              style={styles.avatarTouchable}
              activeOpacity={0.8}
              testID="avatar-button"
            >
              {profile?.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitials}>{initials}</Text>
                </View>
              )}
              <View style={styles.cameraBadge}>
                {isUploadingAvatar ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Camera size={14} color="#fff" />
                )}
              </View>
            </TouchableOpacity>

            <View style={styles.statsRow}>
              <TouchableOpacity
                style={styles.statItem}
                onPress={() => openFollowsModal('followers')}
                activeOpacity={0.7}
                testID="followers-button"
              >
                <Text style={styles.statNumber}>{followersCount}</Text>
                <Text style={styles.statLabel}>följare</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.statItem}
                onPress={() => openFollowsModal('following')}
                activeOpacity={0.7}
                testID="following-button"
              >
                <Text style={styles.statNumber}>{followingCount}</Text>
                <Text style={styles.statLabel}>följer</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.displayName}>{profile?.display_name ?? 'Namn'}</Text>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={openEditModal}
              activeOpacity={0.7}
              testID="edit-profile-button"
            >
              <Text style={styles.editButtonText}>Redigera</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Redigera profil</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.modalCloseBtn}>
                <X size={22} color="#999" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Användarnamn</Text>
              <TextInput
                style={styles.textInput}
                value={editUsername}
                onChangeText={setEditUsername}
                placeholder="Användarnamn"
                placeholderTextColor="#666"
                autoCapitalize="none"
                autoCorrect={false}
                testID="edit-username-input"
              />

              <Text style={styles.inputLabel}>Visningsnamn</Text>
              <TextInput
                style={styles.textInput}
                value={editDisplayName}
                onChangeText={setEditDisplayName}
                placeholder="Ditt namn"
                placeholderTextColor="#666"
                testID="edit-displayname-input"
              />

              <TouchableOpacity
                style={[styles.saveButton, isUpdating && styles.saveButtonDisabled]}
                onPress={handleSaveProfile}
                disabled={isUpdating}
                activeOpacity={0.8}
                testID="save-profile-button"
              >
                {isUpdating ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Spara</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={followsModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFollowsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.followsSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {followsTab === 'followers' ? 'Följare' : 'Följer'}
              </Text>
              <TouchableOpacity onPress={() => setFollowsModalVisible(false)} style={styles.modalCloseBtn}>
                <X size={22} color="#999" />
              </TouchableOpacity>
            </View>

            <View style={styles.tabSwitcher}>
              <TouchableOpacity
                style={[styles.tabBtn, followsTab === 'followers' && styles.tabBtnActive]}
                onPress={() => setFollowsTab('followers')}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabBtnText, followsTab === 'followers' && styles.tabBtnTextActive]}>
                  Följare ({followersCount})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabBtn, followsTab === 'following' && styles.tabBtnActive]}
                onPress={() => setFollowsTab('following')}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabBtnText, followsTab === 'following' && styles.tabBtnTextActive]}>
                  Följer ({followingCount})
                </Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={followsTab === 'followers' ? followers : following}
              keyExtractor={(item) => item.id}
              renderItem={renderFollowUser}
              contentContainerStyle={styles.followsList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>
                    {followsTab === 'followers' ? 'Inga följare ännu' : 'Följer ingen ännu'}
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerUsername: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#EFEFEF',
    letterSpacing: 0.3,
  },
  settingsButton: {
    padding: 6,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  profileSection: {},
  profileRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 24,
  },
  avatarTouchable: {
    position: 'relative' as const,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: '#2A2A2A',
  },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#1E1E1E',
    borderWidth: 2,
    borderColor: '#2A2A2A',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  avatarInitials: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#1DB954',
  },
  cameraBadge: {
    position: 'absolute' as const,
    bottom: 0,
    right: -2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1DB954',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderWidth: 2,
    borderColor: '#0A0A0A',
  },
  statsRow: {
    flex: 1,
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
    alignItems: 'center' as const,
  },
  statItem: {
    alignItems: 'center' as const,
    paddingHorizontal: 12,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#EFEFEF',
  },
  statLabel: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  displayName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#D0D0D0',
    marginTop: 16,
  },
  actionRow: {
    flexDirection: 'row' as const,
    marginTop: 18,
    gap: 10,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#EFEFEF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end' as const,
  },
  modalSheet: {
    backgroundColor: '#141414',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    minHeight: 320,
  },
  followsSheet: {
    backgroundColor: '#141414',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: '80%' as const,
    minHeight: 400,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#333',
    alignSelf: 'center' as const,
    marginTop: 12,
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#EFEFEF',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#888',
    marginBottom: 6,
    marginTop: 12,
  },
  textInput: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#EFEFEF',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  saveButton: {
    backgroundColor: '#1DB954',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center' as const,
    marginTop: 24,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  tabSwitcher: {
    flexDirection: 'row' as const,
    marginHorizontal: 20,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 3,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center' as const,
  },
  tabBtnActive: {
    backgroundColor: '#2A2A2A',
  },
  tabBtnText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#666',
  },
  tabBtnTextActive: {
    color: '#EFEFEF',
  },
  followsList: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  followUserRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: 10,
  },
  followUserLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
    marginRight: 12,
  },
  followUserAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  followUserAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  followUserAvatarText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1DB954',
  },
  followUserInfo: {
    marginLeft: 12,
    flex: 1,
  },
  followUserName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#EFEFEF',
  },
  followUserUsername: {
    fontSize: 13,
    color: '#666',
    marginTop: 1,
  },
  followBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 5,
    backgroundColor: '#1DB954',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  followBtnActive: {
    backgroundColor: '#2A2A2A',
  },
  followBtnText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#fff',
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center' as const,
  },
  emptyText: {
    fontSize: 15,
    color: '#666',
  },
});
