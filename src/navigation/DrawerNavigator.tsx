import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { MainChatScreen } from '../screens/MainChatScreen';
import { MCPToolsScreen } from '../screens/MCPToolsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import {
  MessageSquareIcon, UserIcon, LogOutIcon,
} from '../components/icons';
import { colors, spacing, borderRadius } from '../theme';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainChat" component={MainChatScreen} />
      <Stack.Screen name="MCPTools" component={MCPToolsScreen} />
    </Stack.Navigator>
  );
}

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { user, logout } = useAuth();

  return (
    <View style={drawerStyles.container}>
      <View style={drawerStyles.userSection}>
        <View style={drawerStyles.avatar}>
          <Text style={drawerStyles.avatarText}>
            {user?.email ? user.email.charAt(0).toUpperCase() : '?'}
          </Text>
        </View>
        <Text style={drawerStyles.email} numberOfLines={1}>{user?.email}</Text>
      </View>

      <ScrollView style={drawerStyles.nav}>
        <TouchableOpacity
          style={drawerStyles.navItem}
          onPress={() => props.navigation.navigate('Main')}
        >
          <MessageSquareIcon size={20} color={colors.primary} />
          <Text style={[drawerStyles.navText, { color: colors.primary }]}>Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={drawerStyles.navItem}
          onPress={() => props.navigation.navigate('Profile')}
        >
          <UserIcon size={20} color={colors.text} />
          <Text style={drawerStyles.navText}>Perfil</Text>
        </TouchableOpacity>

        <View style={drawerStyles.divider} />

        <TouchableOpacity style={drawerStyles.navItem} onPress={logout}>
          <LogOutIcon size={20} color={colors.danger} />
          <Text style={[drawerStyles.navText, { color: colors.danger }]}>Sair</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={drawerStyles.footer}>
        <Text style={drawerStyles.footerText}>10ContoAI v1.0</Text>
      </View>
    </View>
  );
}

export function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: { backgroundColor: colors.background, width: 280 },
        drawerType: 'front',
        overlayColor: 'rgba(0,0,0,0.6)',
      }}
    >
      <Drawer.Screen name="Main" component={MainStack} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
    </Drawer.Navigator>
  );
}

const drawerStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  userSection: {
    paddingTop: 56, paddingHorizontal: spacing.xl, paddingBottom: spacing.xl,
    borderBottomWidth: 1, borderBottomColor: colors.border, alignItems: 'center',
  },
  avatar: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md,
  },
  avatarText: { color: '#000', fontSize: 22, fontWeight: '700' },
  email: { color: colors.text, fontSize: 15, fontWeight: '600' },
  nav: { flex: 1, paddingTop: spacing.lg },
  navItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl, gap: spacing.md,
  },
  navText: { color: colors.text, fontSize: 16, fontWeight: '500' },
  divider: {
    height: 1, backgroundColor: colors.border, marginVertical: spacing.md,
    marginHorizontal: spacing.xl,
  },
  footer: { padding: spacing.xl, borderTopWidth: 1, borderTopColor: colors.border },
  footerText: { color: colors.mutedForeground, fontSize: 12, textAlign: 'center' },
});
