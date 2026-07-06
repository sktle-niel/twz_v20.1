import LegalPage from '../components/LegalPage'
import { PRIVACY_POLICY } from '../data/legal'

export default function PrivacyPolicy() {
  return <LegalPage {...PRIVACY_POLICY} />
}
