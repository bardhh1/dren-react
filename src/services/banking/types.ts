export type Account = {
  id: string
  name: string
  type: "checking" | "savings"
  balance: number
  currency: "USD"
}

export type BankCard = {
  id: string
  name: string
  network: "Visa" | "Mastercard"
  last4: string
  limit: number
  spent: number
  color: string
  status: "active" | "frozen"
}

export type TransactionType = "income" | "expense" | "transfer" | "bill"

export type Transaction = {
  id: string
  title: string
  category: string
  date: string
  amount: number
  type: TransactionType
  accountId: string
}

export type Payee = {
  id: string
  name: string
  accountRef: string
  dueDate: string
  amountDue: number
}

export type SavingsGoal = {
  id: string
  name: string
  targetAmount: number
  savedAmount: number
  deadline: string
}

export type SecuritySettings = {
  biometricLogin: boolean
  instantAlerts: boolean
  transferLimit: number
}

export type BankingSnapshot = {
  accounts: Account[]
  cards: BankCard[]
  transactions: Transaction[]
  payees: Payee[]
  goals: SavingsGoal[]
  security: SecuritySettings
}

export type TransferInput = {
  fromAccountId: string
  toAccountId: string
  amount: number
  note?: string
}

export type BillPayInput = {
  fromAccountId: string
  payeeId: string
  amount: number
}

export type CardLimitInput = {
  cardId: string
  limit: number
}

export type CardFreezeInput = {
  cardId: string
  freeze: boolean
}

export type SecurityInput = {
  key: keyof Pick<SecuritySettings, "biometricLogin" | "instantAlerts">
  value: boolean
}
