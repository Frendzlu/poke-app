import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type RootStackParamList = {
  Tabs: undefined;
  Camera: undefined;
};

export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
