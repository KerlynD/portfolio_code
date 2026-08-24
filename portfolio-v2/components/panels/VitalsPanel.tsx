import { getSiteConfig } from '@/lib/content'
import Editable from '@/components/edit/Editable'
import ConfigFieldEditor from '@/components/edit/ConfigFieldEditor'

/**
 * Shared Vitals panel — identical on every page that shows it.
 * Values come from the site config; editing here updates every instance.
 */
export default async function VitalsPanel() {
  const siteConfig = await getSiteConfig()
  const location = siteConfig.location.replace(/[^\x00-\x7F]/g, '').trim()
  const nowCompany = siteConfig.currentRole.split(/\bat\b/).pop()?.trim() ?? siteConfig.currentRole

  return (
    <Editable
      label="Vitals"
      editor={
        <ConfigFieldEditor
          fields={[
            { key: 'statusMessage', label: 'Status', value: siteConfig.statusMessage },
            { key: 'location', label: 'Based', value: siteConfig.location },
            { key: 'graduationYear', label: 'Graduation year', value: siteConfig.graduationYear },
            { key: 'currentRole', label: 'Now (role)', value: siteConfig.currentRole },
            { key: 'focus', label: 'Focus', value: siteConfig.focus },
          ]}
        />
      }
    >
      <section className="panel">
        <div className="ph">
          <span className="title">Vitals</span>
        </div>
        <div className="pb">
          <span className="status">» {siteConfig.statusMessage} «</span>
          <table className="vitals">
            <tbody>
              <tr>
                <td className="k">Based</td>
                <td className="v">{location}</td>
              </tr>
              <tr>
                <td className="k">School</td>
                <td className="v">CUNY Queens &apos;{siteConfig.graduationYear.slice(2)}</td>
              </tr>
              <tr>
                <td className="k">Now</td>
                <td className="v">{nowCompany}</td>
              </tr>
              <tr>
                <td className="k">Focus</td>
                <td className="v">{siteConfig.focus}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </Editable>
  )
}
