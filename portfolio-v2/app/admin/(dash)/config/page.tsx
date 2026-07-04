import { getSiteConfig } from '@/lib/content'
import { saveConfig } from '@/lib/actions/config'

export const dynamic = 'force-dynamic'

export default async function ConfigAdmin() {
  const c = await getSiteConfig()
  const skills = c.skills ?? { languages: [], infrastructure: [], databases: [], tools: [] }

  return (
    <>
      <h1 className="admin-h">
        <span className="slash">/</span> Site config
      </h1>
      <p className="admin-sub">Bio, vitals, currently, links &amp; skills — shows across the whole site.</p>

      <form action={saveConfig} className="admin-form">
        <div className="row2">
          <div className="field"><label>Name</label><input name="name" defaultValue={c.name} /></div>
          <div className="field"><label>Short name</label><input name="shortName" defaultValue={c.shortName} /></div>
        </div>
        <div className="row2">
          <div className="field"><label>Title</label><input name="title" defaultValue={c.title} /></div>
          <div className="field"><label>Email</label><input name="email" defaultValue={c.email} /></div>
        </div>
        <div className="row2">
          <div className="field"><label>Location</label><input name="location" defaultValue={c.location} /></div>
          <div className="field"><label>Status message (vitals badge)</label><input name="statusMessage" defaultValue={c.statusMessage} /></div>
        </div>
        <div className="row2">
          <div className="field"><label>School</label><input name="school" defaultValue={c.school} /></div>
          <div className="field"><label>Graduation year</label><input name="graduationYear" defaultValue={c.graduationYear} /></div>
        </div>
        <div className="row2">
          <div className="field"><label>Education (display)</label><input name="education" defaultValue={c.education} /></div>
          <div className="field"><label>Current role</label><input name="currentRole" defaultValue={c.currentRole} /></div>
        </div>
        <div className="row2">
          <div className="field"><label>Focus (vitals)</label><input name="focus" defaultValue={c.focus} /></div>
          <div className="field"><label>Building (currently)</label><input name="building" defaultValue={c.building} /></div>
        </div>
        <div className="row2">
          <div className="field"><label>Currently reading</label><input name="currentlyReading" defaultValue={c.currentlyReading} /></div>
          <div className="field"><label>On the shelf</label><input name="onTheShelf" defaultValue={c.onTheShelf} /></div>
        </div>
        <div className="field"><label>About tagline</label><input name="aboutTagline" defaultValue={c.aboutTagline} /></div>
        <div className="field">
          <label>Bio</label>
          <textarea name="bio" defaultValue={c.bio} style={{ minHeight: 70, fontFamily: 'var(--sans)', fontSize: 13 }} />
        </div>
        <div className="field">
          <label>About description</label>
          <textarea name="aboutDescription" defaultValue={c.aboutDescription} style={{ minHeight: 80, fontFamily: 'var(--sans)', fontSize: 13 }} />
        </div>

        <h1 className="admin-h" style={{ fontSize: 16 }}>
          <span className="slash">/</span> Links
        </h1>
        <div className="row2">
          <div className="field"><label>GitHub</label><input name="link_github" defaultValue={c.links.github} /></div>
          <div className="field"><label>LinkedIn</label><input name="link_linkedin" defaultValue={c.links.linkedin} /></div>
        </div>
        <div className="row2">
          <div className="field"><label>Email link (mailto:…)</label><input name="link_email" defaultValue={c.links.email} /></div>
          <div className="field"><label>Résumé URL</label><input name="link_resume" defaultValue={c.links.resume} /></div>
        </div>

        <h1 className="admin-h" style={{ fontSize: 16 }}>
          <span className="slash">/</span> Skills
        </h1>
        <div className="field"><label>Languages (comma-separated)</label><input name="skill_languages" defaultValue={skills.languages.join(', ')} /></div>
        <div className="field"><label>Infrastructure</label><input name="skill_infrastructure" defaultValue={skills.infrastructure.join(', ')} /></div>
        <div className="field"><label>Databases</label><input name="skill_databases" defaultValue={skills.databases.join(', ')} /></div>
        <div className="field"><label>Tools</label><input name="skill_tools" defaultValue={skills.tools.join(', ')} /></div>

        <div className="field">
          <label>Achievements (advanced — JSON)</label>
          <textarea name="achievements" defaultValue={JSON.stringify(c.achievements, null, 2)} />
          <span className="hint">Array of objects: title, organization, description, icon. Keep it valid JSON.</span>
        </div>

        <div className="admin-actions">
          <button className="btn" type="submit">Save config</button>
        </div>
      </form>
    </>
  )
}
