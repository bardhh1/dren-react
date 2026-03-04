import { createContext, FC, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react"

import { mockBankingApi } from "@/services/banking/mockBankingApi"
import type {
  BankingSnapshot,
  BillPayInput,
  CardFreezeInput,
  CardLimitInput,
  SecurityInput,
  TransferInput,
} from "@/services/banking/types"

type BankingContextValue = {
  data: BankingSnapshot | null
  loading: boolean
  actionLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  submitTransfer: (input: TransferInput) => Promise<void>
  submitBillPay: (input: BillPayInput) => Promise<void>
  setCardFreeze: (input: CardFreezeInput) => Promise<void>
  updateCardLimit: (input: CardLimitInput) => Promise<void>
  updateSecurity: (input: SecurityInput) => Promise<void>
}

const BankingContext = createContext<BankingContextValue | null>(null)

export const BankingProvider: FC<PropsWithChildren> = ({ children }) => {
  const [data, setData] = useState<BankingSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = async () => {
    setError(null)
    setLoading(true)

    try {
      const snapshot = await mockBankingApi.getSnapshot()
      setData(snapshot)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load banking data")
    } finally {
      setLoading(false)
    }
  }

  const withAction = async (action: () => Promise<BankingSnapshot>, message: string) => {
    setError(null)
    setActionLoading(true)

    try {
      const snapshot = await action()
      setData(snapshot)
    } catch (err) {
      setError(err instanceof Error ? err.message : message)
      throw err
    } finally {
      setActionLoading(false)
    }
  }

  const submitTransfer = (input: TransferInput) => {
    return withAction(() => mockBankingApi.transfer(input), "Transfer failed")
  }

  const submitBillPay = (input: BillPayInput) => {
    return withAction(() => mockBankingApi.payBill(input), "Bill payment failed")
  }

  const setCardFreeze = (input: CardFreezeInput) => {
    return withAction(() => mockBankingApi.setCardFreeze(input), "Card status update failed")
  }

  const updateCardLimit = (input: CardLimitInput) => {
    return withAction(() => mockBankingApi.updateCardLimit(input), "Card limit update failed")
  }

  const updateSecurity = (input: SecurityInput) => {
    return withAction(() => mockBankingApi.updateSecurity(input), "Security settings update failed")
  }

  useEffect(() => {
    refresh()
  }, [])

  const value = useMemo(
    () => ({
      data,
      loading,
      actionLoading,
      error,
      refresh,
      submitTransfer,
      submitBillPay,
      setCardFreeze,
      updateCardLimit,
      updateSecurity,
    }),
    [data, loading, actionLoading, error],
  )

  return <BankingContext.Provider value={value}>{children}</BankingContext.Provider>
}

export function useBankingStore() {
  const value = useContext(BankingContext)
  if (!value) {
    throw new Error("useBankingStore must be used within BankingProvider")
  }
  return value
}
