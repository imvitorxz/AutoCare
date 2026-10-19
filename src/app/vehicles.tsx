import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";

import { useRouter } from "expo-router";
import AppHeader from "@/components/AppHeader";
import { colors } from "@/constants/theme";
import {
  getVehicles,
  saveVehicles,
  type Vehicle,
} from "@/services/vehiclesStorage";

export default function VehiclesScreen() {
  const router = useRouter();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [veiculo, setVeiculo] = useState("");
  const [placa, setPlaca] = useState("");
  const [km, setKm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadVehicles() {
      try {
        const savedVehicles = await getVehicles();
        setVehicles(savedVehicles);
      } catch {
        notify("Não foi possível carregar os veículos.");
      } finally {
        setLoading(false);
      }
    }

    loadVehicles();
  }, []);

  function notify(message: string) {
    if (Platform.OS === "web") {
      window.alert(message);
    } else {
      Alert.alert("AutoCare", message);
    }
  }

  function clearForm() {
    setVeiculo("");
    setPlaca("");
    setKm("");
    setEditingId(null);
  }

  async function saveVehicle() {
    if (saving) return;

    if (!veiculo.trim() || !placa.trim() || !km.trim()) {
      notify("Preencha todos os campos.");
      return;
    }

    if (!/^\d+$/.test(km.trim())) {
      notify("A quilometragem deve conter apenas números.");
      return;
    }

    const normalizedPlate = placa.trim().toUpperCase();

    const duplicatePlate = vehicles.some(
      (vehicle) =>
        vehicle.placa.toUpperCase() === normalizedPlate &&
        vehicle.id !== editingId
    );

    if (duplicatePlate) {
      notify("Já existe um veículo cadastrado com essa placa.");
      return;
    }

    const updatedVehicles: Vehicle[] = editingId
      ? vehicles.map((vehicle) =>
          vehicle.id === editingId
            ? {
                ...vehicle,
                veiculo: veiculo.trim(),
                placa: normalizedPlate,
                km: km.trim(),
              }
            : vehicle
        )
      : [
          ...vehicles,
          {
            id: `${Date.now()}-${Math.random()}`,
            veiculo: veiculo.trim(),
            placa: normalizedPlate,
            km: km.trim(),
          },
        ];

    setSaving(true);

    try {
      await saveVehicles(updatedVehicles);

      setVehicles(updatedVehicles);

      notify(
        editingId
          ? "Veículo atualizado com sucesso!"
          : "Veículo cadastrado com sucesso!"
      );

      clearForm();
    } catch {
      notify("Não foi possível salvar o veículo.");
    } finally {
      setSaving(false);
    }
  }

  function editVehicle(vehicle: Vehicle) {
    setEditingId(vehicle.id);
    setVeiculo(vehicle.veiculo);
    setPlaca(vehicle.placa);
    setKm(vehicle.km);
  }

  async function deleteVehicle(id: string) {
    const vehicleToDelete = vehicles.find(
      (vehicle) => vehicle.id === id
    );

    if (!vehicleToDelete || saving) return;

    const remove = async () => {
      const updatedVehicles = vehicles.filter(
        (vehicle) => vehicle.id !== id
      );

      setSaving(true);

      try {
        await saveVehicles(updatedVehicles);

        setVehicles(updatedVehicles);

        if (editingId === id) {
          clearForm();
        }

        notify("Veículo excluído com sucesso!");
      } catch {
        notify("Não foi possível excluir o veículo.");
      } finally {
        setSaving(false);
      }
    };

    if (Platform.OS === "web") {
      if (
        window.confirm(
          `Deseja realmente excluir o veículo ${vehicleToDelete.veiculo}?`
        )
      ) {
        await remove();
      }
    } else {
      Alert.alert(
        "Excluir veículo",
        `Deseja realmente excluir ${vehicleToDelete.veiculo}?`,
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Excluir",
            style: "destructive",
            onPress: () => {
              void remove();
            },
          },
        ]
      );
    }
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Gerencie seus veículos" />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable
          style={styles.backButton}
          onPress={() => router.push("/")}
        >
          <Text style={styles.backText}>‹ Voltar ao início</Text>
        </Pressable>

        <Text style={styles.title}>Meus veículos</Text>

        <Text style={styles.description}>
          Cadastre seus veículos e mantenha os dados organizados.
        </Text>

        <View style={styles.form}>
          <Text style={styles.formTitle}>
            {editingId ? "Editar veículo" : "Cadastrar veículo"}
          </Text>

          <Text style={styles.label}>Modelo do veículo *</Text>

          <TextInput
            style={styles.input}
            placeholder="Ex.: Honda Civic 2022"
            placeholderTextColor="#888888"
            value={veiculo}
            onChangeText={setVeiculo}
            editable={!saving}
          />

          <Text style={styles.label}>Placa *</Text>

          <TextInput
            style={styles.input}
            placeholder="Ex.: ABC1D23"
            placeholderTextColor="#888888"
            value={placa}
            onChangeText={(value) =>
              setPlaca(
                value
                  .replace(/[^a-zA-Z0-9]/g, "")
                  .toUpperCase()
                  .slice(0, 7)
              )
            }
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={7}
            editable={!saving}
          />

          <Text style={styles.label}>Quilometragem atual *</Text>

          <TextInput
            style={styles.input}
            placeholder="Ex.: 45000"
            placeholderTextColor="#888888"
            value={km}
            onChangeText={(value) =>
              setKm(value.replace(/\D/g, ""))
            }
            keyboardType="numeric"
            editable={!saving}
          />

          <Pressable
            style={[
              styles.primaryButton,
              saving && styles.disabledButton,
            ]}
            onPress={saveVehicle}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {editingId
                  ? "Salvar alterações"
                  : "+ Cadastrar veículo"}
              </Text>
            )}
          </Pressable>

          {editingId && (
            <Pressable
              style={styles.cancelButton}
              onPress={clearForm}
              disabled={saving}
            >
              <Text style={styles.cancelText}>
                Cancelar edição
              </Text>
            </Pressable>
          )}
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>
            Veículos cadastrados
          </Text>

          <View style={styles.counter}>
            <Text style={styles.counterText}>
              {vehicles.length}
            </Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={colors.green}
            style={styles.loader}
          />
        ) : vehicles.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🚘</Text>

            <Text style={styles.emptyTitle}>
              Nenhum veículo cadastrado
            </Text>

            <Text style={styles.emptyDescription}>
              Preencha o formulário acima para adicionar seu primeiro
              veículo.
            </Text>
          </View>
        ) : (
          vehicles.map((vehicle) => (
            <View key={vehicle.id} style={styles.vehicleCard}>
              <View style={styles.vehicleHeader}>
                <Text style={styles.vehicleIcon}>🚗</Text>

                <View style={styles.vehicleHeading}>
                  <Text style={styles.vehicleName}>
                    {vehicle.veiculo}
                  </Text>

                  <Text style={styles.plate}>
                    {vehicle.placa}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <Text style={styles.vehicleInfo}>
                Quilometragem atual
              </Text>

              <Text style={styles.kmValue}>
                {Number(vehicle.km).toLocaleString("pt-BR")} km
              </Text>

              <View style={styles.actions}>
                <Pressable
                  style={styles.editButton}
                  onPress={() => editVehicle(vehicle)}
                  disabled={saving}
                >
                  <Text style={styles.editButtonText}>
                    Editar
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.deleteButton}
                  onPress={() => {
                    void deleteVehicle(vehicle.id);
                  }}
                  disabled={saving}
                >
                  <Text style={styles.deleteButtonText}>
                    Excluir
                  </Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 14,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 6,
  },
  backText: {
    color: colors.green,
    fontWeight: "700",
    fontSize: 15,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.dark,
  },
  description: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 21,
  },
  form: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 18,
    gap: 10,
  },
  formTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: colors.dark,
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.dark,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.dark,
    backgroundColor: "#FFFFFF",
  },
  primaryButton: {
    backgroundColor: colors.green,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 6,
    minHeight: 48,
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  disabledButton: {
    opacity: 0.6,
  },
  cancelButton: {
    padding: 10,
    alignItems: "center",
  },
  cancelText: {
    color: colors.muted,
    fontWeight: "600",
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.dark,
  },
  counter: {
    backgroundColor: colors.green,
    borderRadius: 20,
    minWidth: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  counterText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  loader: {
    marginVertical: 30,
  },
  empty: {
    padding: 24,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    gap: 10,
  },
  emptyIcon: {
    fontSize: 36,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.dark,
    textAlign: "center",
  },
  emptyDescription: {
    color: colors.muted,
    textAlign: "center",
    lineHeight: 21,
  },
  vehicleCard: {
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  vehicleHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  vehicleIcon: {
    fontSize: 30,
  },
  vehicleHeading: {
    flex: 1,
    gap: 5,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.dark,
  },
  plate: {
    color: colors.green,
    fontWeight: "800",
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  vehicleInfo: {
    fontSize: 13,
    color: colors.muted,
  },
  kmValue: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.dark,
    marginTop: -8,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  editButton: {
    flex: 1,
    backgroundColor: colors.dark,
    padding: 12,
    borderRadius: 9,
    alignItems: "center",
  },
  editButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.danger,
    padding: 12,
    borderRadius: 9,
    alignItems: "center",
  },
  deleteButtonText: {
    color: colors.danger,
    fontWeight: "700",
  },
});