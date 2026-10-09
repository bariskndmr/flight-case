import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { FlightDto } from '../api/flight.types';

export type TabParamList = {
  Flights: undefined;
  Favorites: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  // The flight itself is passed in: list and favorites already hold the full DTO, so detail needs no extra request.
  FlightDetail: { flight: FlightDto };
};

export type FlightDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'FlightDetail'>;

export type TabScreenProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;
