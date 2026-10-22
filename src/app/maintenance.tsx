import { useFocusEffect } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

import AppHeader from "@/components/AppHeader";
import { colors } from "@/constants/theme";
import {
  getVehicles,
  type Vehicle,
} from "@/services/vehiclesStorage";

type Maintenance = {
  id: string;
  vehicleId: string;
  veiculo: string;
  servico: string;
  data: string;
  km: string;
  valor: string;
  observacoes: string;
};

const STORAGE_KEY = "@autocare:maintenances";

export default function MaintenanceScreen() {
  const router = useRouter();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);

  const [vehicleId, setVehicleId] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [servico, setServico] = useState("");
  const [data, setData] = useState("");
  const [km, setKm] = useState("");
  const [valor, setValor] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      let active = true;

      async function loadData() {
        try {
          const [savedVehicles, savedMaintenances] = await Promise.all([
            getVehicles(),
            AsyncStorage.getItem(STORAGE_KEY),
          ]);

          if (!active) return;

          setVehicles(savedVehicles);

          if (savedMaintenances) {
            setMaintenances(JSON.parse(savedMaintenances));
          } else {
            setMaintenances([]);
          }
        } catch (error) {
          console.error("Erro ao carregar dados:", error);
          notify("Não foi possível carregar os dados.");
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      }

      void loadData();

      return () => {
        active = false;
      };
    }, [])
  );

  function notify(message: string) {
    if (Platform.OS === "web") {
      window.alert(message);
    } else {
      Alert.alert("AutoCare", message);
    }
  }

  const selectedVehicle = vehicles.find(
    (vehicle) => vehicle.id === vehicleId
  );

  function formatDateInput(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 8);

    if (digits.length <= 2) {
      return digits;
    }

    if (digits.length <= 4) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }

    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  }

  function clearForm() {
    setVehicleId("");
    setServico("");
    setData("");
    setKm("");
    setValor("");
    setObservacoes("");
    setEditingId(null);
    setDropdownOpen(false);
  }

  async function persistMaintenances(updated: Maintenance[]) {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated)
    );

    setMaintenances(updated);
  }

  function isValidDate(value: string) {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      return false;
    }

    const [day, month, year] = value.split("/").map(Number);

    const dateObject = new Date(year, month - 1, day);

    return (
      dateObject.getFullYear() === year &&
      dateObject.getMonth() === month - 1 &&
      dateObject.getDate() === day
    );
  }

  async function saveMaintenance() {
    if (saving) return;

    if (!vehicleId || !selectedVehicle) {
      notify("Selecione um veículo cadastrado.");
      return;
    }

    if (!servico.trim() || !data || !km || !valor.trim()) {
      notify("Preencha todos os campos obrigatórios.");
      return;
    }

    if (!isValidDate(data)) {
      notify("Informe uma data válida no formato DD/MM/AAAA.");
      return;
    }

    if (!/^\d+$/.test(km)) {
      notify("A quilometragem deve conter apenas números.");
      return;
    }

    const normalizedValue = valor.trim().replace(",", ".");

    if (!/^\d+(\.\d{1,2})?$/.test(normalizedValue)) {
      notify("Informe um valor válido. Ex.: 250 ou 250,50.");
      return;
    }

    const numericValue = Number(normalizedValue);

    if (!Number.isFinite(numericValue) || numericValue < 0) {
      notify("O valor deve ser zero ou positivo.");
      return;
    }

    const maintenanceData = {
      vehicleId: selectedVehicle.id,
      veiculo: `${selectedVehicle.veiculo} — ${selectedVehicle.placa}`,
      servico: servico.trim(),
      data,
      km,
      valor: numericValue.toFixed(2),
      observacoes: observacoes.trim(),
    };

    const updatedMaintenances: Maintenance[] = editingId
      ? maintenances.map((item) =>
          item.id === editingId
            ? { ...item, ...maintenanceData }
            : item
        )
      : [
          {
            id: `${Date.now()}-${Math.random()}`,
            ...maintenanceData,
          },
          ...maintenances,
        ];

    setSaving(true);

    try {
      await persistMaintenances(updatedMaintenances);

      notify(
        editingId
          ? "Manutenção atualizada com sucesso!"
          : "Manutenção cadastrada com sucesso!"
      );

      clearForm();
    } catch (error) {
      console.error("Erro ao salvar manutenção:", error);
      notify("Não foi possível salvar a manutenção.");
    } finally {
      setSaving(false);
    }
  }

  function editMaintenance(item: Maintenance) {
    setEditingId(item.id);
    setVehicleId(item.vehicleId);
    setServico(item.servico);
    setData(item.data);
    setKm(item.km);
    setValor(item.valor.replace(".", ","));
    setObservacoes(item.observacoes);
    setDropdownOpen(false);
  }

  async function deleteMaintenance(id: string) {
    if (saving) return;

    const remove = async () => {
      const updatedMaintenances = maintenances.filter(
        (item) => item.id !== id
      );

      setSaving(true);

      try {
        await persistMaintenances(updatedMaintenances);

        if (editingId === id) {
          clearForm();
        }

        notify("Manutenção excluída com sucesso!");
      } catch (error) {
        console.error("Erro ao excluir manutenção:", error);
        notify("Não foi possível excluir a manutenção.");
      } finally {
        setSaving(false);
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm("Deseja excluir esta manutenção?")) {
        await remove();
      }
    } else {
      Alert.alert(
        "Excluir manutenção",
        "Deseja realmente excluir este registro?",
        [
          { text: "Cancelar", style: "cancel" },
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
      <AppHeader title="Histórico de manutenções" />

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

        <Text style={styles.title}>Manutenções</Text>

        <Text style={styles.description}>
          Registre revisões, trocas de óleo e reparos dos seus veículos.
        </Text>

        <View style={styles.form}>
          <Text style={styles.formTitle}>
            {editingId ? "Editar manutenção" : "Registrar manutenção"}
          </Text>

          <Text style={styles.label}>Veículo *</Text>

          <Pressable
            style={styles.dropdown}
            onPress={() => setDropdownOpen(!dropdownOpen)}
          >
            <Text
              style={[
                styles.dropdownText,
                !selectedVehicle && styles.placeholder,
              ]}
            >
              {selectedVehicle
                ? `${selectedVehicle.veiculo} — ${selectedVehicle.placa}`
                : "Selecione um veículo"}
            </Text>

            <Text style={styles.dropdownArrow}>
              {dropdownOpen ? "▲" : "▼"}
            </Text>
          </Pressable>

          {dropdownOpen && (
            <View style={styles.dropdownList}>
              {vehicles.length === 0 ? (
                <Text style={styles.noVehicles}>
                  Nenhum veículo cadastrado. Cadastre um veículo primeiro.
                </Text>
              ) : (
                vehicles.map((vehicle) => (
                  <Pressable
                    key={vehicle.id}
                    style={styles.dropdownOption}
                    onPress={() => {
                      setVehicleId(vehicle.id);
                      setDropdownOpen(false);
                    }}
                  >
                    <Text style={styles.optionName}>
                      {vehicle.veiculo}
                    </Text>

                    <Text style={styles.optionPlate}>
                      {vehicle.placa}
                    </Text>
                  </Pressable>
                ))
              )}
            </View>
          )}

          <Text style={styles.label}>Serviço realizado *</Text>

          <TextInput
            style={styles.input}
            placeholder="Ex.: Troca de óleo"
            placeholderTextColor="#888888"
            value={servico}
            onChangeText={setServico}
            editable={!saving}
          />

          <Text style={styles.label}>Data do serviço *</Text>

          <TextInput
            style={styles.input}
            placeholder="DD/MM/AAAA"
            placeholderTextColor="#888888"
            value={data}
            onChangeText={(value) =>
              setData(formatDateInput(value))
            }
            keyboardType="numeric"
            maxLength={10}
            editable={!saving}
          />

          <Text style={styles.helper}>
            Digite dia, mês e ano. As barras são inseridas automaticamente.
          </Text>

          <Text style={styles.label}>Quilometragem (km) *</Text>

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

          <Text style={styles.label}>Valor do serviço (R$) *</Text>

          <TextInput
            style={styles.input}
            placeholder="Ex.: 250,00"
            placeholderTextColor="#888888"
            value={valor}
            onChangeText={(value) =>
              setValor(value.replace(/[^0-9.,]/g, ""))
            }
            keyboardType="decimal-pad"
            editable={!saving}
          />

          <Text style={styles.helper}>
            Use apenas números e, se necessário, vírgula ou ponto para os centavos.
          </Text>

          <Text style={styles.label}>Observações</Text>

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Detalhes adicionais (opcional)"
            placeholderTextColor="#888888"
            value={observacoes}
            onChangeText={setObservacoes}
            multiline
            numberOfLines={4}
            editable={!saving}
          />

          <Pressable
            style={[
              styles.primaryButton,
              saving && styles.disabledButton,
            ]}
            onPress={() => {
              void saveMaintenance();
            }}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {editingId
                  ? "Salvar alterações"
                  : "+ Registrar manutenção"}
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
            Histórico registrado
          </Text>

          <View style={styles.counter}>
            <Text style={styles.counterText}>
              {maintenances.length}
            </Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={colors.green}
            style={styles.loader}
          />
        ) : maintenances.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔧</Text>

            <Text style={styles.emptyTitle}>
              Nenhuma manutenção registrada
            </Text>

            <Text style={styles.emptyDescription}>
              Os registros aparecerão aqui após o primeiro cadastro.
            </Text>
          </View>
        ) : (
          maintenances.map((item) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.serviceTitle}>
                {item.servico}
              </Text>

              <Text style={styles.vehicleName}>
                🚗 {item.veiculo}
              </Text>

              <View style={styles.divider} />

              <Text style={styles.info}>
                📅 Data: {item.data}
              </Text>

              <Text style={styles.info}>
                🛣️ Quilometragem:{" "}
                {Number(item.km).toLocaleString("pt-BR")} km
              </Text>

              <Text style={styles.value}>
                R${" "}
                {Number(item.valor).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>

              {item.observacoes ? (
                <Text style={styles.observations}>
                  Observações: {item.observacoes}
                </Text>
              ) : null}

              <View style={styles.actions}>
                <Pressable
                  style={styles.editButton}
                  onPress={() => editMaintenance(item)}
                  disabled={saving}
                >
                  <Text style={styles.editButtonText}>
                    Editar
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.deleteButton}
                  onPress={() => {
                    void deleteMaintenance(item.id);
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
  textArea: {
    minHeight: 95,
    textAlignVertical: "top",
  },
  helper: {
    fontSize: 12,
    color: colors.muted,
    lineHeight: 17,
    marginTop: -4,
  },
  dropdown: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    backgroundColor: "#FFFFFF",
  },
  dropdownText: {
    flex: 1,
    fontSize: 15,
    color: colors.dark,
  },
  placeholder: {
    color: "#888888",
  },
  dropdownArrow: {
    color: colors.green,
    fontSize: 13,
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9,
    overflow: "hidden",
  },
  dropdownOption: {
    padding: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: "#FFFFFF",
    gap: 4,
  },
  optionName: {
    color: colors.dark,
    fontWeight: "700",
    fontSize: 15,
  },
  optionPlate: {
    color: colors.green,
    fontWeight: "700",
    fontSize: 13,
  },
  noVehicles: {
    padding: 14,
    color: colors.muted,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: colors.green,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    marginTop: 6,
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
  card: {
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  serviceTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: colors.dark,
  },
  vehicleName: {
    fontSize: 14,
    color: colors.green,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  info: {
    fontSize: 14,
    color: colors.muted,
  },
  value: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.dark,
    marginTop: 4,
  },
  observations: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 21,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
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