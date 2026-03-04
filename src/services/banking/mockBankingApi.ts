import { delay } from "@/utils/delay"

import type {
  BankingSnapshot,
  BillPayInput,
  CardFreezeInput,
  CardLimitInput,
  SecurityInput,
  Transaction,
  TransferInput,
} from "./types"

const now = new Date()

function asIsoDay(offsetDays = 0) {
  const copy = new Date(now)
  copy.setDate(copy.getDate() + offsetDays)
  return copy.toISOString().slice(0, 10)
}

let db: BankingSnapshot = {
  accounts: [
    { id: "acc-checking", name: "Main Checking", type: "checking", balance: 8240.35, currency: "USD" },
    { id: "acc-savings", name: "Emergency Savings", type: "savings", balance: 4600, currency: "USD" },
  ],
  cards: [
    {
      id: "card-1",
      name: "Everyday Card",
      network: "Visa",
      last4: "4821",
      limit: 5000,
      spent: 1342.21,
      color: "#0057D9",
      status: "active",
    },
    {
      id: "card-2",
      name: "Travel Card",
      network: "Mastercard",
      last4: "3310",
      limit: 8000,
      spent: 2275.5,
      color: "#C62828",
      status: "active",
    },
  ],
  transactions: [
    {
      id: "tx-income-1",
      title: "Payroll",
      category: "Income",
      date: asIsoDay(-3),
      amount: 3200,
      type: "income",
      accountId: "acc-checking",
    },
    {
      id: "tx-expense-1",
      title: "Grocery Hub",
      category: "Food",
      date: asIsoDay(-2),
      amount: -124.8,
      type: "expense",
      accountId: "acc-checking",
    },
    {
      id: "tx-expense-2",
      title: "Electric Bill",
      category: "Utilities",
      date: asIsoDay(-1),
      amount: -84.65,
      type: "bill",
      accountId: "acc-checking",
    },
  ],
  payees: [
    {
      id: "payee-power",
      name: "City Power",
      accountRef: "****1033",
      dueDate: asIsoDay(6),
      amountDue: 94.22,
    },
    {
      id: "payee-water",
      name: "Metro Water",
      accountRef: "****8421",
      dueDate: asIsoDay(12),
      amountDue: 52.31,
    },
    {
      id: "payee-internet",
      name: "FiberNet",
      accountRef: "****1198",
      dueDate: asIsoDay(9),
      amountDue: 79.0,
    },
  ],
  goals: [
    {
      id: "goal-vacation",
      name: "Summer Vacation",
      targetAmount: 3500,
      savedAmount: 1680,
      deadline: asIsoDay(120),
    },
    {
      id: "goal-home",
      name: "Home Down Payment",
      targetAmount: 25000,
      savedAmount: 9400,
      deadline: asIsoDay(420),
    },
  ],
  security: {
    biometricLogin: true,
    instantAlerts: true,
    transferLimit: 3000,
  },
}

function cloneSnapshot(): BankingSnapshot {
  return {
    accounts: db.accounts.map((item) => ({ ...item })),
    cards: db.cards.map((item) => ({ ...item })),
    transactions: db.transactions.map((item) => ({ ...item })),
    payees: db.payees.map((item) => ({ ...item })),
    goals: db.goals.map((item) => ({ ...item })),
    security: { ...db.security },
  }
}

function createTx(entry: Omit<Transaction, "id" | "date">): Transaction {
  return {
    ...entry,
    id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    date: new Date().toISOString().slice(0, 10),
  }
}

function findAccount(accountId: string) {
  const account = db.accounts.find((item) => item.id === accountId)
  if (!account) throw new Error("Account not found")
  return account
}

export const mockBankingApi = {
  async getSnapshot(): Promise<BankingSnapshot> {
    await delay(220)
    return cloneSnapshot()
  },

  async transfer(input: TransferInput): Promise<BankingSnapshot> {
    await delay(350)

    if (input.fromAccountId === input.toAccountId) {
      throw new Error("Transfer accounts must be different")
    }
    if (!Number.isFinite(input.amount) || input.amount <= 0) {
      throw new Error("Transfer amount must be greater than zero")
    }

    if (input.amount > db.security.transferLimit) {
      throw new Error(`Transfer exceeds your limit of $${db.security.transferLimit}`)
    }

    const from = findAccount(input.fromAccountId)
    const to = findAccount(input.toAccountId)

    if (from.balance < input.amount) {
      throw new Error("Insufficient funds")
    }

    from.balance -= input.amount
    to.balance += input.amount

    db.transactions = [
      createTx({
        title: `Transfer to ${to.name}`,
        category: input.note || "Transfer",
        amount: -input.amount,
        type: "transfer",
        accountId: from.id,
      }),
      createTx({
        title: `Transfer from ${from.name}`,
        category: input.note || "Transfer",
        amount: input.amount,
        type: "transfer",
        accountId: to.id,
      }),
      ...db.transactions,
    ]

    return cloneSnapshot()
  },

  async payBill(input: BillPayInput): Promise<BankingSnapshot> {
    await delay(350)

    if (!Number.isFinite(input.amount) || input.amount <= 0) {
      throw new Error("Bill amount must be greater than zero")
    }

    const from = findAccount(input.fromAccountId)
    const payee = db.payees.find((item) => item.id === input.payeeId)
    if (!payee) throw new Error("Payee not found")

    if (from.balance < input.amount) {
      throw new Error("Insufficient funds")
    }

    from.balance -= input.amount
    payee.amountDue = Math.max(payee.amountDue - input.amount, 0)

    db.transactions = [
      createTx({
        title: `Bill paid: ${payee.name}`,
        category: "Bill Payment",
        amount: -input.amount,
        type: "bill",
        accountId: from.id,
      }),
      ...db.transactions,
    ]

    return cloneSnapshot()
  },

  async setCardFreeze(input: CardFreezeInput): Promise<BankingSnapshot> {
    await delay(180)

    const card = db.cards.find((item) => item.id === input.cardId)
    if (!card) throw new Error("Card not found")

    card.status = input.freeze ? "frozen" : "active"
    return cloneSnapshot()
  },

  async updateCardLimit(input: CardLimitInput): Promise<BankingSnapshot> {
    await delay(180)

    if (!Number.isFinite(input.limit) || input.limit < 500) {
      throw new Error("Card limit must be at least $500")
    }

    const card = db.cards.find((item) => item.id === input.cardId)
    if (!card) throw new Error("Card not found")

    card.limit = Math.round(input.limit)
    return cloneSnapshot()
  },

  async updateSecurity(input: SecurityInput): Promise<BankingSnapshot> {
    await delay(150)

    db.security[input.key] = input.value
    return cloneSnapshot()
  },
}
