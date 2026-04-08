import { CreditCard } from 'lucide-react'
import {
  VisaFlatIcon,
  MastercardFlatIcon,
  AmexIcon,
  DiscoverFlatIcon,
} from 'react-svg-credit-card-payment-icons'

export function getCardNetworkIcon(network: string, size: number = 24) {
  switch (network.toLowerCase()) {
    case 'visa':
      return <VisaFlatIcon width={size} />
    case 'mastercard':
      return <MastercardFlatIcon width={size} />
    case 'amex':
      return <AmexIcon width={size} />
    case 'discover':
      return <DiscoverFlatIcon width={size} />
    default:
      return <CreditCard size={size} />
  }
}
import { Dropdown } from '@/components/ui/Dropdown'
import { useAuth } from '@/context/AuthContext'

interface Props {
  value: string
  onChange: (id: string) => void
}

export function CardAliasDropdown({ value, onChange }: Props) {
  const { user } = useAuth()

  return (
    <Dropdown
      value={value || undefined}
      onChange={onChange}
      placeholder="No card"
        options={[
        { value: '', label: 'No card', icon: <CreditCard size={24} /> },
        ...(user?.card_aliases ?? []).map(card => ({
          value: card.id,
          label: card.card_name + (card.last4 ? ` (**** ${card.last4})` : ''),
          icon: getCardNetworkIcon(card.card_network, 24)
        })),
      ]}
    />
  )
}
