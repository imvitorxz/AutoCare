import { ScrollView, View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import AppHeader from "@/components/AppHeader";
import { colors } from "@/constants/theme";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <AppHeader />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.greeting}>Olá! 👋</Text>
        <Text style={styles.title}>Bem-vindo ao AutoCare</Text>
        <Text style={styles.description}>
          Cuide do seu veículo e mantenha tudo organizado em um só lugar.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🚗 Seus veículos</Text>
          <Text style={styles.cardDescription}>
            Cadastre seus veículos e consulte as informações sempre que precisar.
          </Text>

          <Pressable
            style={styles.button}
            onPress={() => router.push("/vehicles")}
          >
            <Text style={styles.buttonText}>Gerenciar veículos</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔧 Manutenções</Text>
          <Text style={styles.cardDescription}>
            Organize o histórico de revisões, reparos e outros serviços.
          </Text>

          <Pressable
            style={styles.button}
            onPress={() => router.push("/maintenance")}
          >
            <Text style={styles.buttonText}>Ver manutenções</Text>
          </Pressable>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Seu veículo. Seu histórico.</Text>
          <Text style={styles.infoDescription}>
            Mais organização e controle para cuidar do seu carro.
          </Text>
        </View>
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
    paddingBottom: 35,
    gap: 18,
  },
  greeting: {
    fontSize: 16,
    color: colors.muted,
  },
  title: {
    fontSize: 25,
    fontWeight: "800",
    color: colors.dark,
  },
  description: {
    fontSize: 15,
    color: colors.muted,
    lineHeight: 22,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: colors.dark,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.muted,
  },
  button: {
    backgroundColor: colors.green,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  infoBox: {
    backgroundColor: colors.dark,
    borderRadius: 16,
    padding: 20,
    gap: 8,
  },
  infoTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.green,
  },
  infoDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: "#FFFFFF",
  },
});