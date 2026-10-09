import Ionicons from '@expo/vector-icons/Ionicons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FavoritesScreen } from '../features/favorites/FavoritesScreen';
import { FlightDetailScreen } from '../features/flights/FlightDetailScreen';
import { FlightListScreen } from '../features/flights/FlightListScreen';
import type { RootStackParamList, TabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function Tabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Flights"
        component={FlightListScreen}
        options={{
          title: 'Uçuşlar',
          tabBarIcon: ({ color, size }) => <Ionicons name="airplane-outline" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          title: 'Favoriler',
          tabBarIcon: ({ color, size }) => <Ionicons name="heart-outline" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="FlightDetail"
        component={FlightDetailScreen}
        options={{ title: 'Uçuş Detayı', headerBackButtonDisplayMode: 'minimal' }}
      />
    </Stack.Navigator>
  );
}
