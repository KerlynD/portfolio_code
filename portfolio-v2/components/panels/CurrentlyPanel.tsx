import { getSiteConfig } from '@/lib/content'
import Editable from '@/components/edit/Editable'
import ConfigFieldEditor from '@/components/edit/ConfigFieldEditor'

/**
 * Shared Currently panel — identical on every page that shows it.
 * Editing it here updates it everywhere (all instances read the same config).
 */
export default async function CurrentlyPanel() {
  const siteConfig = await getSiteConfig()
  return (
    <Editable
      label="Currently"
      editor={
        <ConfigFieldEditor
          fields={[
            { key: 'currentlyReading', label: 'Reading', value: siteConfig.currentlyReading },
            { key: 'onTheShelf', label: 'On the shelf', value: siteConfig.onTheShelf },
            { key: 'building', label: 'Building', value: siteConfig.building },
          ]}
        />
      }
    >
      <section className="panel">
        <div className="ph">
          <span className="title">Currently</span>
        </div>
        <div className="pb nowbox">
          <div className="np">
            <span className="nk">Reading</span>
            <br />
            {siteConfig.currentlyReading}
          </div>
          <div className="np">
            <span className="nk">On the shelf</span>
            <br />
            {siteConfig.onTheShelf}
          </div>
          <div className="np">
            <span className="nk">Building</span>
            <br />
            {siteConfig.building}
          </div>
        </div>
      </section>
    </Editable>
  )
}
