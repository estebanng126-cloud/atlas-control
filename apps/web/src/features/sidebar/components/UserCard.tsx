export type UserCardProps = {
  /** Nombre visible (una línea, ellipsis si no cabe) */
  name: string;
  /** URL de avatar; si falta, se muestra inicial sobre fondo neutro */
  avatarUrl?: string;
  /** Indicador tipo “en línea” (punto verde) */
  online?: boolean;
};

const AVATAR_INITIAL_FALLBACK = "?";

export function UserCard({ name, avatarUrl, online = true }: UserCardProps) {
  const initial = name.trim().charAt(0).toUpperCase() || AVATAR_INITIAL_FALLBACK;

  return (
    <div className="user-card">
      <div className="user-card__identity">
        <div className="user-card__avatar-wrap">
          {avatarUrl ? (
            <img className="user-card__avatar" src={avatarUrl} alt="" width={40} height={40} />
          ) : (
            <div className="user-card__avatar user-card__avatar--placeholder" aria-hidden>
              {initial}
            </div>
          )}
          {online ? <span className="user-card__status" title="En línea" /> : null}
        </div>
        <span className="user-card__name">{name}</span>
      </div>
    </div>
  );
}
