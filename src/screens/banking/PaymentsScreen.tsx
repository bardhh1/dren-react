import { FC, useEffect, useMemo, useState } from "react"
import { Pressable, StyleSheet, View, ViewStyle } from "react-native"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { useBankingStore } from "@/features/banking/BankingStore"
import { useAppTheme } from "@/theme/context"

type PaymentMode = "transfer" | "bill"

function currency(value: number) {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export const PaymentsScreen: FC = function PaymentsScreen() {
  const { theme, themed } = useAppTheme()
  const { data, actionLoading, error, submitTransfer, submitBillPay } = useBankingStore()

  const [mode, setMode] = useState<PaymentMode>("transfer")
  const [fromAccountId, setFromAccountId] = useState("")
  const [toAccountId, setToAccountId] = useState("")
  const [payeeId, setPayeeId] = useState("")
  const [transferAmount, setTransferAmount] = useState("")
  const [billAmount, setBillAmount] = useState("")
  const [note, setNote] = useState("")
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const accounts = data?.accounts || []
  const payees = data?.payees || []

  useEffect(() => {
    if (!accounts.length) return

    if (!fromAccountId || !accounts.some((account) => account.id === fromAccountId)) {
      setFromAccountId(accounts[0].id)
    }

    const transferTargets = accounts.filter((account) => account.id !== fromAccountId)
    if (
      transferTargets.length &&
      (!toAccountId || !transferTargets.some((account) => account.id === toAccountId))
    ) {
      setToAccountId(transferTargets[0].id)
    }
  }, [accounts, fromAccountId, toAccountId])

  useEffect(() => {
    if (payees.length && (!payeeId || !payees.some((payee) => payee.id === payeeId))) {
      setPayeeId(payees[0].id)
    }
  }, [payees, payeeId])

  const transferTargets = useMemo(
    () => accounts.filter((account) => account.id !== fromAccountId),
    [accounts, fromAccountId],
  )

  const selectedPayee = payees.find((payee) => payee.id === payeeId)

  const onTransfer = async () => {
    const amount = Number(transferAmount)
    if (!fromAccountId || !toAccountId || !Number.isFinite(amount) || amount <= 0) return

    try {
      await submitTransfer({
        fromAccountId,
        toAccountId,
        amount,
        note: note.trim() || undefined,
      })
      setTransferAmount("")
      setNote("")
      setSuccessMessage(`Transfer submitted: ${currency(amount)}`)
    } catch {
      // Error is already captured in store state.
    }
  }

  const onBillPay = async () => {
    const amount = Number(billAmount)
    if (!fromAccountId || !payeeId || !Number.isFinite(amount) || amount <= 0) return

    try {
      await submitBillPay({
        fromAccountId,
        payeeId,
        amount,
      })
      setBillAmount("")
      setSuccessMessage(`Bill paid: ${currency(amount)}`)
    } catch {
      // Error is already captured in store state.
    }
  }

  return (
    <Screen preset="scroll" safeAreaEdges={["top", "bottom"]}>
      <View style={styles.container}>
        <Text preset="subheading">Payments</Text>

        <View style={styles.segmentRow}>
          <Pressable
            onPress={() => setMode("transfer")}
            style={themed([
              styles.segment,
              { backgroundColor: mode === "transfer" ? theme.colors.tint : theme.colors.palette.neutral100 },
            ])}
          >
            <Text size="xs" style={{ color: mode === "transfer" ? "#FFFFFF" : theme.colors.text }}>
              Transfer
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setMode("bill")}
            style={themed([
              styles.segment,
              { backgroundColor: mode === "bill" ? theme.colors.tint : theme.colors.palette.neutral100 },
            ])}
          >
            <Text size="xs" style={{ color: mode === "bill" ? "#FFFFFF" : theme.colors.text }}>
              Bill Pay
            </Text>
          </Pressable>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.palette.neutral100 }]}> 
          <Text size="xs" style={{ color: theme.colors.textDim }}>
            From account
          </Text>
          <View style={styles.choices}>
            {accounts.map((account) => (
              <Pressable
                key={account.id}
                onPress={() => setFromAccountId(account.id)}
                style={[
                  styles.choice,
                  {
                    borderColor: account.id === fromAccountId ? theme.colors.tint : theme.colors.border,
                  },
                ]}
              >
                <Text size="xxs">{account.name}</Text>
                <Text size="xxs" style={{ color: theme.colors.textDim }}>
                  {currency(account.balance)}
                </Text>
              </Pressable>
            ))}
          </View>

          {mode === "transfer" ? (
            <>
              <Text size="xs" style={{ color: theme.colors.textDim, marginTop: 8 }}>
                To account
              </Text>
              <View style={styles.choices}>
                {transferTargets.map((account) => (
                  <Pressable
                    key={account.id}
                    onPress={() => setToAccountId(account.id)}
                    style={[
                      styles.choice,
                      {
                        borderColor: account.id === toAccountId ? theme.colors.tint : theme.colors.border,
                      },
                    ]}
                  >
                    <Text size="xxs">{account.name}</Text>
                    <Text size="xxs" style={{ color: theme.colors.textDim }}>
                      {currency(account.balance)}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <TextField
                label="Amount"
                keyboardType="decimal-pad"
                placeholder="0.00"
                value={transferAmount}
                onChangeText={setTransferAmount}
              />
              <TextField
                label="Note (optional)"
                placeholder="Rent, savings, etc"
                value={note}
                onChangeText={setNote}
              />

              <Button
                text={actionLoading ? "Submitting..." : "Submit Transfer"}
                preset="reversed"
                disabled={actionLoading}
                onPress={onTransfer}
              />
            </>
          ) : (
            <>
              <Text size="xs" style={{ color: theme.colors.textDim, marginTop: 8 }}>
                Payee
              </Text>
              <View style={styles.choices}>
                {payees.map((payee) => (
                  <Pressable
                    key={payee.id}
                    onPress={() => {
                      setPayeeId(payee.id)
                      setBillAmount(payee.amountDue.toFixed(2))
                    }}
                    style={[
                      styles.choice,
                      {
                        borderColor: payee.id === payeeId ? theme.colors.tint : theme.colors.border,
                      },
                    ]}
                  >
                    <Text size="xxs">{payee.name}</Text>
                    <Text size="xxs" style={{ color: theme.colors.textDim }}>
                      Due {payee.dueDate}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {!!selectedPayee && (
                <Text size="xs" style={{ color: theme.colors.textDim }}>
                  Amount due: {currency(selectedPayee.amountDue)} ({selectedPayee.accountRef})
                </Text>
              )}

              <TextField
                label="Amount"
                keyboardType="decimal-pad"
                placeholder="0.00"
                value={billAmount}
                onChangeText={setBillAmount}
              />

              <Button
                text={actionLoading ? "Paying..." : "Pay Bill"}
                preset="reversed"
                disabled={actionLoading}
                onPress={onBillPay}
              />
            </>
          )}
        </View>

        {!!successMessage && (
          <Text size="xs" style={{ color: "#2E7D32" }}>
            {successMessage}
          </Text>
        )}
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
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
  } as ViewStyle,
  segmentRow: {
    flexDirection: "row",
    gap: 10,
  } as ViewStyle,
  segment: {
    alignItems: "center",
    borderRadius: 10,
    flex: 1,
    paddingVertical: 10,
  } as ViewStyle,
  card: {
    borderRadius: 14,
    gap: 10,
    padding: 12,
  } as ViewStyle,
  choices: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  } as ViewStyle,
  choice: {
    borderRadius: 10,
    borderWidth: 1,
    minWidth: "48%",
    paddingHorizontal: 10,
    paddingVertical: 8,
  } as ViewStyle,
})
