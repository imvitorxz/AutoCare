import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";

import { colors } from "../constants/theme";

type Props = {
  title?: string;
  onBack?: () => void;
};

export default function AppHeader({ title, onBack }: Props) {
  return (
    <View style={styles.header}>
      {onBack && (
        <Pressable
          onPress={onBack}
          style={styles.backButton}
          accessibilityRole="button"
        >
          <Text style={styles.backText}>‹ Voltar</Text>
        </Pressable>
      )}

      <Text style={styles.brand}>AutoCare</Text>

      <Text style={styles.subtitle}>
        {title ?? "Seu veículo. Seu histórico. Seu controle."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.dark,
    minHeight: 145,
    paddingTop: 24,
    paddingHorizontal: 18,
    paddingBottom: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  brand: {
    color: colors.green,
    fontSize: 42,
    fontWeight: "800",
  },

  subtitle: {
    color: "#FFFFFF",
    fontSize: 13,
    marginTop: 7,
    textAlign: "center",
  },

  backButton: {
    position: "absolute",
    top: 10,
    left: 12,
    zIndex: 2,
    padding: 8,
  },

  backText: {
    color: colors.green,
    fontWeight: "700",
    fontSize: 16,
  },
});