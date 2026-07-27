import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { HomeScreen } from '../screens/HomeScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { MCPToolsScreen } from '../screens/MCPToolsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { colors, spacing, borderRadius } from '../theme';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="MCPTools" component={MCPToolsScreen} />
    </Stack.Navigator>
  );
}

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { user, logout } = useAuth();

  return (
    <View style={drawerStyles.container}>
      {/* User info */}
      <View style={drawerStyles.userSection}>
        <View style={drawerStyles.avatar}>
          <Text style={drawerStyles.avatarText}>
            {user?.email ? user.email.charAt(0).toUpperCase() : '?'}
          </Text>
        </View>
        <Text style={drawerStyles.email} numberOfLines={1}>{user?.email}</Text>
        <Text style={drawerStyles.plan}>Plano Starter</Text>
      </View>

      {/* Nav items */}
      <ScrollView style={drawerStyles.nav}>
        <TouchableOpacity
          style={drawerStyles.navItem}
          onPress={() => props.navigation.navigate('Home')}
        >
          <Text style={drawerStyles.navIcon}>{'\u{1F3E0}'}</Text>
          <Text style={drawerStyles.navText}>Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={drawerStyles.navItem}
          onPress={() => props.navigation.navigate('Profile')}
        >
          <Text style={drawerStyles.navIcon}>{'\u{1F464}'}</Text>
          <Text style={drawerStyles.navText}>Perfil</Text>
        </TouchableOpacity>

        <View style={drawerStyles.divider} />

        <TouchableOpacity style={drawerStyles.navItem} onPress={logout}>
          <Text style={drawerStyles.navIcon}>{'\u{1F6AA}'}</Text>
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
        drawerStyle: {
          backgroundColor: colors.background,
          width: 280,
        },
        drawerType: 'front',
        overlayColor: 'rgba(0,0,0,0.6)',
      }}
    >
      <Drawer.Screen name="Home" component={HomeStack} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
    </Drawer.Navigator>
  );
}

const drawerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  userSection: {
    paddingTop: 56,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    color: '#000',
    fontSize: 22,
    fontWeight: '700',
  },
  email: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  plan: {
    color: colors.accent,
    fontSize: 12,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  nav: {
    flex: 1,
    paddingTop: spacing.lg,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  navIcon: {
    fontSize: 18,
  },
  navText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: spacing.md,
    marginHorizontal: spacing.xl,
  },
  footer: {
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },
});
