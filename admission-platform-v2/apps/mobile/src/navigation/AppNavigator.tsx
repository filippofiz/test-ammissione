import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';

export type RootStackParamList = {
  Login: undefined;
  StudentDashboard: undefined;
  TutorDashboard: undefined;
  Test: { testId: string };
  Results: { testId: string };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#fff' },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        {/* Future screens will be added here */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
