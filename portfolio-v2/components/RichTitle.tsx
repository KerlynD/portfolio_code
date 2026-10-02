import { splitEmoji, type EmojiMap } from '@/lib/emoji'

/** A post title with `:name:` custom emojis rendered inline. */
export default function RichTitle({ text, emojis }: { text: string; emojis: EmojiMap }) {
  return (
    <>
      {splitEmoji(text, emojis).map((p, i) =>
        typeof p === 'string' ? (
          p
        ) : (
          <img key={i} className="emoji" src={p.url} alt={`:${p.name}:`} title={`:${p.name}:`} draggable={false} />
        )
      )}
    </>
  )
}
