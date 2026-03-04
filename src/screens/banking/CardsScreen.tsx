import { FC } from "react"
import { Pressable, StyleSheet, View, ViewStyle } from "react-native"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useBankingStore } from "@/features/banking/BankingStore"
import { useAppTheme } from "@/theme/context"

function currency(value: number) {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export const CardsScreen: FC = function CardsScreen() {
  const { theme } = useAppTheme()
  const { data, actionLoading, setCardFreeze, updateCardLimit } = useBankingStore()

  return (
    <Screen
      preset="scroll"
      safeAreaEdges={["top", "bottom"]}
      ScrollViewProps={{ showsVerticalScrollIndicator: false, bounces: true }}
    >
      <View style={styles.container}>
        <Text preset="subheading">Cards</Text>
        {(data?.cards || []).map((card) => {
          const utilization = Math.min((card.spent / card.limit) * 100, 100)
          const isFrozen = card.status === "frozen"

          return (
            <View key={card.id} style={[styles.card, { backgroundColor: theme.colors.palette.neutral100 }]}> 
              <View style={[styles.cardTop, { backgroundColor: card.color }]}> 
                <Text size="xs" style={{ color: "#E8EEF8" }}>
                  {card.network}
                </Text>
                <Text preset="subheading" style={{ color: "#FFFFFF", marginTop: 8 }}>
                  •••• {card.last4}
                </Text>
              </View>

              <View style={{ gap: 6 }}>
                <View style={styles.rowBetween}>
                  <Text weight="medium">{card.name}</Text>
                  <Text size="xs" style={{ color: theme.colors.textDim }}>
                    {card.status.toUpperCase()}
                  </Text>
                </View>

                <View style={styles.rowBetween}>
                  <Text size="xs" style={{ color: theme.colors.textDim }}>
                    Spent
                  </Text>
                  <Text size="xs">
                    {currency(card.spent)} / {currency(card.limit)}
                  </Text>
                </View>

                <View style={[styles.track, { backgroundColor: theme.colors.palette.neutral200 }]}> 
                  <View style={[styles.fill, { width: `${utilization}%`, backgroundColor: card.color }]} />
                </View>

                <View style={styles.actionsRow}>
                  <Pressable
                    style={[styles.action, { borderColor: theme.colors.tint }]}
                    onPress={() => setCardFreeze({ cardId: card.id, freeze: !isFrozen })}
                    disabled={actionLoading}
                  >
                    <Text size="xxs" style={{ color: theme.colors.tint }}>
                      {isFrozen ? "Unfreeze" : "Freeze"}
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[styles.action, { borderColor: theme.colors.tint }]}
                    onPress={() => updateCardLimit({ cardId: card.id, limit: card.limit + 500 })}
                    disabled={actionLoading}
                  >
                    <Text size="xxs" style={{ color: theme.colors.tint }}>
                      +$500 Limit
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[styles.action, { borderColor: theme.colors.tint }]}
                    onPress={() => updateCardLimit({ cardId: card.id, limit: Math.max(500, card.limit - 500) })}
                    disabled={actionLoading}
                  >
                    <Text size="xxs" style={{ color: theme.colors.tint }}>
                      -$500 Limit
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )
        })}
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
  card: {
    borderRadius: 16,
    gap: 12,
    overflow: "hidden",
    paddingBottom: 14,
  } as ViewStyle,
  cardTop: {
    paddingHorizontal: 14,
    paddingVertical: 16,
  } as ViewStyle,
  rowBetween: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 14,
  } as ViewStyle,
  track: {
    borderRadius: 999,
    height: 8,
    marginHorizontal: 14,
    overflow: "hidden",
  } as ViewStyle,
  fill: {
    borderRadius: 999,
    height: "100%",
  } as ViewStyle,
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 4,
  } as ViewStyle,
  action: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  } as ViewStyle,
})
