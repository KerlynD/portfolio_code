import siteConfig from '@/data/siteConfig.json'

/**
 * Shared Vitals panel — identical on every page that shows it.
 * Edit the rows here (or the underlying siteConfig fields) once.
 */
export default function VitalsPanel() {
  const location = siteConfig.location.replace(/[^\x00-\x7F]/g, '').trim()
  const nowCompany = siteConfig.currentRole.split(/\bat\b/).pop()?.trim() ?? siteConfig.currentRole

  return (
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
  )
}
