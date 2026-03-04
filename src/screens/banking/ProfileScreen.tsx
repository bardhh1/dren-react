import { FC } from "react"
import { Pressable, StyleSheet, View, ViewStyle } from "react-native"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useBankingStore } from "@/features/banking/BankingStore"
import { useAppTheme } from "@/theme/context"

function currency(value: number) {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export const ProfileScreen: FC = function ProfileScreen() {
  const { theme } = useAppTheme()
  const { data, refresh, loading, actionLoading, updateSecurity } = useBankingStore()

  const accountCount = data?.accounts.length || 0
  const cardCount = data?.cards.length || 0
  const totalBalance = (data?.accounts || []).reduce((sum, account) => sum + account.balance, 0)

  return (
    <Screen preset="scroll" safeAreaEdges={["top", "bottom"]}>
      <View style={styles.container}>
        <Text preset="subheading">Profile</Text>

        <View style={[styles.panel, { backgroundColor: theme.colors.palette.neutral100 }]}> 
          <Text weight="medium">Dren Luzha</Text>
          <Text size="xs" style={{ color: theme.colors.textDim }}>
            Premium Customer • ID 0972
          </Text>
        </View>

        <View style={[styles.panel, { backgroundColor: theme.colors.palette.neutral100 }]}> 
          <Text weight="medium">Portfolio</Text>
          <View style={styles.rowBetween}>
            <Text size="xs" style={{ color: theme.colors.textDim }}>
              Linked accounts
            </Text>
            <Text>{accountCount}</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text size="xs" style={{ color: theme.colors.textDim }}>
              Active cards
            </Text>
            <Text>{cardCount}</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text size="xs" style={{ color: theme.colors.textDim }}>
              Net balance
            </Text>
            <Text weight="medium">{currency(totalBalance)}</Text>
          </View>
        </View>

        <View style={[styles.panel, { backgroundColor: theme.colors.palette.neutral100 }]}> 
          <Text weight="medium">Security Center</Text>
          <View style={styles.rowBetween}>
            <Text size="xs">Biometric login</Text>
            <Pressable
              disabled={actionLoading}
              onPress={() =>
                updateSecurity({
                  key: "biometricLogin",
                  value: !(data?.security.biometricLogin ?? false),
                })
              }
              style={[
                styles.toggle,
                {
                  borderColor: theme.colors.tint,
                  backgroundColor: data?.security.biometricLogin ? theme.colors.tint : theme.colors.transparent,
                },
              ]}
            >
              <Text size="xxs" style={{ color: data?.security.biometricLogin ? "#FFFFFF" : theme.colors.tint }}>
                {data?.security.biometricLogin ? "ON" : "OFF"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.rowBetween}>
            <Text size="xs">Instant transaction alerts</Text>
            <Pressable
              disabled={actionLoading}
              onPress={() =>
                updateSecurity({
                  key: "instantAlerts",
                  value: !(data?.security.instantAlerts ?? false),
                })
              }
              style={[
                styles.toggle,
                {
                  borderColor: theme.colors.tint,
                  backgroundColor: data?.security.instantAlerts ? theme.colors.tint : theme.colors.transparent,
                },
              ]}
            >
              <Text size="xxs" style={{ color: data?.security.instantAlerts ? "#FFFFFF" : theme.colors.tint }}>
                {data?.security.instantAlerts ? "ON" : "OFF"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.rowBetween}>
            <Text size="xs" style={{ color: theme.colors.textDim }}>
              Daily transfer limit
            </Text>
            <Text size="xs">{currency(data?.security.transferLimit || 0)}</Text>
          </View>
        </View>

        <Pressable
          onPress={refresh}
          style={[styles.refreshButton, { borderColor: theme.colors.tint, opacity: loading ? 0.6 : 1 }]}
          disabled={loading}
        >
          <Text size="xs" style={{ color: theme.colors.tint }}>
            {loading ? "Refreshing..." : "Refresh Profile Data"}
          </Text>
        </Pressable>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
  } as ViewStyle,
  panel: {
    borderRadius: 14,
    gap: 10,
    padding: 14,
  } as ViewStyle,
  rowBetween: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  } as ViewStyle,
  toggle: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    minWidth: 58,
    paddingHorizontal: 12,
    paddingVertical: 6,
  } as ViewStyle,
  refreshButton: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  } as ViewStyle,
})
