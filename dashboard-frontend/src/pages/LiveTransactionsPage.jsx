import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import TransactionTable from '../components/TransactionTable'

export default function LiveTransactionsPage() {
  const { data, setSelectedTxn } = useOutletContext()
  const [filters, setFilters] = useState({ risk: 'All', device: 'All', city: 'All' })

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-lg font-semibold">Live Transactions</h1>
        <p className="text-sm text-muted">
          The most recent {data?.recent_transactions?.length ?? 0} transactions scored by the pipeline.
          Click any row for the full SHAP explanation.
        </p>
      </div>
      <TransactionTable
        transactions={data?.recent_transactions}
        filters={filters}
        onFilterChange={setFilters}
        onSelectTxn={setSelectedTxn}
        isOpen
        onToggleOpen={() => {}}
      />
    </div>
  )
}
