import AsyncStorage from "@react-native-async-storage/async-storage";

export type Vehicle = {
  id: string;
  veiculo: string;
  placa: string;
  km: string;
};

const STORAGE_KEY = "@autocare:vehicles";

export async function getVehicles(): Promise<Vehicle[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);

    if (!data) {
      return [];
    }

    return JSON.parse(data) as Vehicle[];
  } catch (error) {
    console.error("Erro ao carregar veículos:", error);
    return [];
  }
}

export async function saveVehicles(
  vehicles: Vehicle[]
): Promise<void> {
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(vehicles)
  );
}