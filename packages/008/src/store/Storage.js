import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const storage = () => Platform.OS === 'web' ? localStorage : AsyncStorage;
