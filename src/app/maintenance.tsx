import { useState } from "react";
import {
    Alert,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import AppHeader from "@/components/AppHeader";
import { colors } from "@/constants/theme";
import { useRouter } from "expo-router";

type Maintenance = {
  id: string;
  veiculo: string;
  servico: string;
  data: string;
  km: string;
  valor: string;
  observacoes: string;
};

export default function MaintenanceScreen() {
  const router = useRouter();

  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);

  const [veiculo, setVeiculo] = useState("");
  const [servico, setServico] = useState("");
  const [data, setData] = useState("");
  const [km, setKm] = useState("");
  const [valor, setValor] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);

  function notify(message: string) {
    if (Platform.OS === "web") {
      window.alert(message);
    } else {
      Alert.alert("AutoCare", message);
    }
  }

  function clearForm() {
    setVeiculo("");
    setServico("");
    setData("");
    setKm("");
    setValor("");
    setObservacoes("");
    setEditingId(null);
  }

  function saveMaintenance() {
    if (
      !veiculo.trim() ||
      !servico.trim() ||
      !data.trim() ||
      !km.trim() ||
      !valor.trim()
    ) {
      notify("Preencha todos os campos obrigatórios.");
      return;
    }

    if (!/^\d+$/.test(km.trim())) {
      notify("A quilometragem deve conter apenas números.");
      return;
    }

    const normalizedDate = data.trim();

    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(normalizedDate)) {
      notify("Informe a data no formato DD/MM/AAAA.");
      return;
    }

    const [day, month, year] = normalizedDate.split("/").map(Number);
    const parsedDate = new Date(year, month - 1, day);

    if (
      parsedDate.getFullYear() !== year ||
      parsedDate.getMonth() !== month - 1 ||
      parsedDate.getDate() !== day
    ) {
      notify("Informe uma data válida.");
      return;
    }

    const normalizedValue = valor.trim().replace(",", ".");
    const numericValue = Number(normalizedValue);

    if (
      !Number.isFinite(numericValue) ||
      numericValue < 0 ||
      !/^\d+([.,]\d{1,2})?$/.test(valor.trim())
    ) {
      notify("Informe um valor válido. Ex.: 250,00.");
      return;
    }

    const maintenanceData = {
      veiculo: veiculo.trim(),
      servico: servico.trim(),
      data: normalizedDate,
      km: km.trim(),
      valor: numericValue.toFixed(2),
      observacoes: observacoes.trim(),
    };

    if (editingId) {
      setMaintenances((current) =>
        current.map((item) =>
          item.id === editingId
            ? { ...item, ...maintenanceData }
            : item
        )
      );

      notify("Manutenção atualizada com sucesso!");
    } else {
      const newMaintenance: Maintenance = {
        id: `${Date.now()}-${Math.random()}`,
        ...maintenanceData,
      };

      setMaintenances((current) => [newMaintenance, ...current]);

      notify("Manutenção cadastrada com sucesso!");
    }

    clearForm();
  }

  function editMaintenance(item: Maintenance) {
    setEditingId(item.id);
    setVeiculo(item.veiculo);
    setServico(item.servico);
    setData(item.data);
    setKm(item.km);
    setValor(item.valor.replace(".", ","));
    setObservacoes(item.observacoes);
  }

  function deleteMaintenance(id: string) {
    const remove = () => {
      setMaintenances((current) =>
        current.filter((item) => item.id !== id)
      );

      if (editingId === id) {
        clearForm();
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm("Deseja realmente excluir esta manutenção?")) {
        remove();
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
            onPress: remove,
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
          Registre revisões, trocas de óleo, reparos e outros serviços
          realizados nos seus veículos.
        </Text>

        <View style={styles.form}>
          <Text style={styles.formTitle}>
            {editingId ? "Editar manutenção" : "Registrar manutenção"}
          </Text>

          <Text style={styles.label}>Veículo *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex.: Honda Civic — ABC1D23"
            placeholderTextColor="#888888"
            value={veiculo}
            onChangeText={setVeiculo}
          />

          <Text style={styles.label}>Serviço realizado *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex.: Troca de óleo"
            placeholderTextColor="#888888"
            value={servico}
            onChangeText={setServico}
          />

          <Text style={styles.label}>Data do serviço *</Text>
          <TextInput
            style={styles.input}
            placeholder="DD/MM/AAAA"
            placeholderTextColor="#888888"
            value={data}
            onChangeText={setData}
            maxLength={10}
          />

          <Text style={styles.label}>Quilometragem *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex.: 45000"
            placeholderTextColor="#888888"
            value={km}
            onChangeText={setKm}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Valor do serviço (R$) *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex.: 250,00"
            placeholderTextColor="#888888"
            value={valor}
            onChangeText={setValor}
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Observações</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Detalhes adicionais (opcional)"
            placeholderTextColor="#888888"
            value={observacoes}
            onChangeText={setObservacoes}
            multiline
            numberOfLines={4}
          />

          <Pressable
            style={styles.primaryButton}
            onPress={saveMaintenance}
          >
            <Text style={styles.primaryButtonText}>
              {editingId ? "Salvar alterações" : "+ Registrar manutenção"}
            </Text>
          </Pressable>

          {editingId && (
            <Pressable
              style={styles.cancelButton}
              onPress={clearForm}
            >
              <Text style={styles.cancelText}>Cancelar edição</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Histórico registrado</Text>

          <View style={styles.counter}>
            <Text style={styles.counterText}>
              {maintenances.length}
            </Text>
          </View>
        </View>

        {maintenances.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔧</Text>

            <Text style={styles.emptyTitle}>
              Nenhuma manutenção registrada
            </Text>

            <Text style={styles.emptyDescription}>
              Seus registros aparecerão aqui depois do primeiro cadastro.
            </Text>
          </View>
        ) : (
          maintenances.map((item) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.serviceTitle}>{item.servico}</Text>

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
                R$ {Number(item.valor).toLocaleString("pt-BR", {
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
                >
                  <Text style={styles.editButtonText}>Editar</Text>
                </Pressable>

                <Pressable
                  style={styles.deleteButton}
                  onPress={() => deleteMaintenance(item.id)}
                >
                  <Text style={styles.deleteButtonText}>Excluir</Text>
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
  primaryButton: {
    backgroundColor: colors.green,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 6,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
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
    marginVertical: 3,
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