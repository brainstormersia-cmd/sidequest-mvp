import * as Location from 'expo-location';

export type LocationPermissionStatus = 'granted' | 'denied';

export const requestLocationPermission = async (): Promise<{
  status: LocationPermissionStatus;
  location?: Location.LocationObject | null;
}> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permesso posizione negato');
      return { status: 'denied' };
    }
    const location = await Location.getCurrentPositionAsync({});
    console.log('Posizione corrente', location.coords);
    return { status: 'granted', location };
  } catch (error) {
    console.warn('Errore richiesta posizione', error);
    return { status: 'denied' };
  }
};
