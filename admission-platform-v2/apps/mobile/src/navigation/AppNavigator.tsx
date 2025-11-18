import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import { RoleSelectionScreen } from '../screens/RoleSelectionScreen';
import { TestSelectionScreen } from '../screens/TestSelectionScreen';
import TutorSelectionScreen from '../screens/TutorSelectionScreen';
import TutorHomeScreen from '../screens/TutorHomeScreen';
import TutorStudentsScreen from '../screens/TutorStudentsScreen';
import StudentProfileScreen from '../screens/StudentProfileScreen';
import StudentHomeScreen from '../screens/StudentHomeScreen';
import TakeTestScreen from '../screens/TakeTestScreen';
import StudentTestsScreen from '../screens/StudentTestsScreen';
import TestResultsScreen from '../screens/TestResultsScreen';
import TestManagementScreen from '../screens/TestManagementScreen';
import ManageSectionOrderScreen from '../screens/ManageSectionOrderScreen';
import TestTypeSelectionScreen from '../screens/TestTypeSelectionScreen';
import TestTrackConfigScreen from '../screens/TestTrackConfigScreen';
import AlgorithmConfigScreen from '../screens/AlgorithmConfigScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import TestRunnerScreen from '../screens/TestRunnerScreen';

export type RootStackParamList = {
  Login: undefined;
  Home: { test?: string } | undefined;
  ChangePassword: undefined;
  RoleSelection: undefined;
  TestSelection: undefined;
  StudentHome: { testType?: string } | undefined;
  TutorSelection: undefined;
  TutorHome: undefined;
  TutorStudents: undefined;
  StudentProfile: { studentId: string };
  StudentTests: { studentId: string; testType: string };
  TakeTest: { assignmentId: string };
  TestResults: { assignmentId: string };
  TestManagement: undefined;
  ManageSectionOrder: undefined;
  TestTypeSelection: undefined;
  TestTrackConfig: { testType?: string } | undefined;
  AlgorithmConfig: undefined;
  AdminDashboard: undefined;
  TestRunner: undefined;
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
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
        <Stack.Screen name="TestSelection" component={TestSelectionScreen} />

        {/* Student Screens */}
        <Stack.Screen name="StudentHome" component={StudentHomeScreen} />
        <Stack.Screen name="TakeTest" component={TakeTestScreen} />
        <Stack.Screen name="TestResults" component={TestResultsScreen} />

        {/* Tutor Screens */}
        <Stack.Screen name="TutorSelection" component={TutorSelectionScreen} />
        <Stack.Screen name="TutorHome" component={TutorHomeScreen} />
        <Stack.Screen name="TutorStudents" component={TutorStudentsScreen} />
        <Stack.Screen name="StudentProfile" component={StudentProfileScreen} />
        <Stack.Screen name="StudentTests" component={StudentTestsScreen} />

        {/* Configuration Screens */}
        <Stack.Screen name="TestManagement" component={TestManagementScreen} />
        <Stack.Screen name="ManageSectionOrder" component={ManageSectionOrderScreen} />
        <Stack.Screen name="TestTypeSelection" component={TestTypeSelectionScreen} />
        <Stack.Screen name="TestTrackConfig" component={TestTrackConfigScreen} />
        <Stack.Screen name="AlgorithmConfig" component={AlgorithmConfigScreen} />

        {/* Admin Screens */}
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
        <Stack.Screen name="TestRunner" component={TestRunnerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
