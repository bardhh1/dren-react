import { FC } from "react"
import { Pressable, StyleSheet, View, ViewStyle } from "react-native"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useBankingStore } from "@/features/banking/BankingStore"
import { useAppTheme } from "@/theme/context"

function currency(value: number) {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export const DashboardScreen: FC = function DashboardScreen() {
  const { theme } = useAppTheme()
  const { data, loading, error, refresh } = useBankingStore()

  const totalBalance = (data?.accounts || []).reduce((sum, account) => sum + account.balance, 0)
  const recent = (data?.transactions || []).slice(0, 6)
  const upcomingBills = (data?.payees || []).filter((payee) => payee.amountDue > 0)

  return (
    <Screen
      preset="scroll"
      safeAreaEdges={["top", "bottom"]}
      ScrollViewProps={{ showsVerticalScrollIndicator: false, bounces: true }}
    >
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text size="xs" style={{ color: theme.colors.textDim }}>
              e-Banking
            </Text>
            <Text preset="subheading">Dashboard</Text>
          </View>
          <Pressable onPress={refresh}>
            <Text size="xs" style={{ color: theme.colors.tint }}>
              Refresh
            </Text>
          </Pressable>
        </View>

        <View style={[styles.balanceCard, { backgroundColor: theme.colors.palette.secondary500 }]}> 
          <Text size="xs" style={{ color: theme.colors.palette.neutral200 }}>
            Total Available Balance
          </Text>
          <Text preset="heading" style={{ color: theme.colors.palette.neutral100, marginTop: 8 }}>
            {currency(totalBalance)}
          </Text>
          <Text size="xxs" style={{ color: theme.colors.palette.neutral200, marginTop: 8 }}>
            {loading ? "Syncing latest account data..." : "All accounts synced"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text preset="subheading">Accounts</Text>
          {(data?.accounts || []).map((account) => (
            <View key={account.id} style={[styles.rowCard, { backgroundColor: theme.colors.palette.neutral100 }]}> 
              <View>
                <Text weight="medium">{account.name}</Text>
                <Text size="xxs" style={{ color: theme.colors.textDim }}>
                  {account.type.toUpperCase()} ACCOUNT
                </Text>
              </View>
              <Text weight="medium">{currency(account.balance)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text preset="subheading">Savings Goals</Text>
          <View style={[styles.blockCard, { backgroundColor: theme.colors.palette.neutral100 }]}> 
            {(data?.goals || []).map((goal) => {
              const progress = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100)

              return (
                <View key={goal.id} style={styles.goalRow}>
                  <View style={styles.rowBetween}>
                    <Text weight="medium">{goal.name}</Text>
                    <Text size="xxs" style={{ color: theme.colors.textDim }}>
                      {currency(goal.savedAmount)} / {currency(goal.targetAmount)}
                    </Text>
                  </View>
                  <View style={[styles.track, { backgroundColor: theme.colors.palette.neutral200 }]}> 
                    <View style={[styles.fill, { width: `${progress}%`, backgroundColor: theme.colors.tint }]} />
                  </View>
                  <Text size="xxs" style={{ color: theme.colors.textDim }}>
                    Deadline {goal.deadline}
                  </Text>
                </View>
              )
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text preset="subheading">Upcoming Bills</Text>
          <View style={[styles.blockCard, { backgroundColor: theme.colors.palette.neutral100 }]}> 
            {upcomingBills.map((payee) => (
              <View key={payee.id} style={styles.transactionRow}>
                <View>
                  <Text weight="medium">{payee.name}</Text>
                  <Text size="xxs" style={{ color: theme.colors.textDim }}>
                    Due {payee.dueDate}
                  </Text>
                </View>
                <Text>{currency(payee.amountDue)}</Text>
              </View>
            ))}
            {!upcomingBills.length && (
              <Text size="xs" style={{ color: theme.colors.textDim }}>
                No upcoming bills.
              </Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text preset="subheading">Recent Transactions</Text>
          <View style={[styles.blockCard, { backgroundColor: theme.colors.palette.neutral100 }]}> 
            {recent.map((tx, index) => {
              const positive = tx.amount > 0
              return (
                <View
                  key={tx.id}
                  style={[
                    styles.transactionRow,
                    index !== recent.length - 1 && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: theme.colors.separator,
                    },
                  ]}
                >
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text weight="medium">{tx.title}</Text>
                    <Text size="xxs" style={{ color: theme.colors.textDim }}>
                      {tx.category} • {tx.date}
                    </Text>
                  </View>
                  <Text style={{ color: positive ? "#2E7D32" : theme.colors.text }}>
                    {positive ? "+" : "-"}
                    {currency(Math.abs(tx.amount))}
                  </Text>
                </View>
              )
            })}
          </View>
        </View>

        {!!error && (
          <Text size="xs" style={{ color: theme.colors.error }}>
            {error}
          </Text>
        )}
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  } as ViewStyle,
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  } as ViewStyle,
  balanceCard: {
    borderRadius: 20,
    padding: 18,
  } as ViewStyle,
  section: {
    gap: 10,
  } as ViewStyle,
  rowCard: {
    alignItems: "center",
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
  } as ViewStyle,
  blockCard: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
  } as ViewStyle,
  goalRow: {
    gap: 6,
    paddingVertical: 10,
  } as ViewStyle,
  rowBetween: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  } as ViewStyle,
  track: {
    borderRadius: 999,
    height: 8,
    overflow: "hidden",
  } as ViewStyle,
  fill: {
    borderRadius: 999,
    height: "100%",
  } as ViewStyle,
  transactionRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
  } as ViewStyle,
})
