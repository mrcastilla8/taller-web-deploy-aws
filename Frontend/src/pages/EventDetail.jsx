import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'
import { api } from '../services/api'
import { formatDate, formatTime, getDayName, isPastEvent } from '../utils/dateUtils'

function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isInscribed, inscribe, cancelInscription, events, favorites, toggleFavorite, student, loading, error: loadError, refresh } = useApp()
  const [reviews, setReviews] = useState(null)
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviewsError, setReviewsError] = useState('')
  const [reviewsAttempt, setReviewsAttempt] = useState(0)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const event = events.find((e) => e.id === Number(id))
  useEffect(() => {
    let active = true
    setReviewsLoading(true)
    setReviewsError('')
    api(`events/${id}/reviews`)
      .then((data) => { if (active) setReviews(data) })
      .catch((err) => { if (active) setReviewsError(err.message) })
      .finally(() => { if (active) setReviewsLoading(false) })
    return () => { active = false }
  }, [id, reviewsAttempt])

  // Evento no encontrado
  if (!event && loading) return <div className="page" role="status">Cargando evento…</div>
  if (!event && loadError) return (
    <div className="page">
      <div className="empty-state" role="alert">
        <span className="empty-state__icon" aria-hidden="true">⚠️</span>
        <h3>No se pudo cargar el evento</h3>
        <p>{loadError}</p>
        <button className="btn btn--primary" onClick={refresh}>Reintentar</button>
      </div>
    </div>
  )
  if (!event) {
    return (
      <div className="page">
        <div className="empty-state">
          <span className="empty-state__icon" aria-hidden="true">❌</span>
          <h3>Evento no encontrado</h3>
          <p>El evento que buscas no existe o fue eliminado.</p>
          <Link to="/" className="btn btn--primary">Volver a Eventos</Link>
        </div>
      </div>
    )
  }

  const past        = isPastEvent(event.date)
  const inscribed   = isInscribed(event.id)
  const totalEnrolled = event.enrolled
  const isFull      = totalEnrolled >= event.capacity
  const spotsLeft   = event.capacity - totalEnrolled
  const fillPercent = Math.min((totalEnrolled / event.capacity) * 100, 100)

  const handleInscribe = async () => { setBusy(true); setError(''); try { await inscribe(event.id) } catch (err) { setError(err.message) } finally { setBusy(false) } }
  const handleCancel = async () => { setBusy(true); setError(''); try { await cancelInscription(event.id) } catch (err) { setError(err.message) } finally { setBusy(false) } }
  const submitReview = async (e) => { e.preventDefault(); setBusy(true); setError(''); try { setReviews(await api(`events/${id}/reviews`, { method: 'PUT', body: { rating: Number(rating), comment } })); setComment('') } catch (err) { setError(err.message) } finally { setBusy(false) } }

  return (
    <div className="page">
      {loadError && <div className="empty-state" role="alert"><p>No se pudo actualizar la información del servidor. {loadError}</p><button className="btn btn--primary" onClick={refresh}>Reintentar</button></div>}

      {/* Botón volver */}
      <button onClick={() => navigate(-1)} className="back-btn">
        ← Volver
      </button>

      <div className="detail-layout">

        {/* Columna principal */}
        <article className="detail-main">
          {error && <p role="alert" className="field-error">{error}</p>}
          <button className="btn btn--outline" disabled={busy} onClick={() => toggleFavorite(event.id).catch((err) => setError(err.message))}>
            {favorites.some((item) => item.id === event.id) ? '♥ Guardado en favoritos' : '♡ Agregar a favoritos'}
          </button>

          {/* Encabezado */}
          <div className="detail-header">
            <div className="detail-header__badges">
              <span className={`badge badge--category badge--${event.category.toLowerCase().replace(/\s/g, '-').replace(/[^a-z-]/g, '')}`}>
                {event.category}
              </span>
              {past
                ? <span className="badge badge--past">Evento realizado</span>
                : isFull && !inscribed
                  ? <span className="badge badge--danger">Cupo lleno</span>
                  : inscribed
                    ? <span className="badge badge--success">✓ Inscrito</span>
                    : <span className="badge badge--upcoming">Próximo</span>
              }
            </div>
            <h2 className="detail-title">{event.title}</h2>
            <p className="detail-description">{event.description}</p>
          </div>

          {/* Agenda de temas (si existe) */}
          {event.agenda && (
            <section className="detail-agenda">
              <h3 className="detail-section-title">📋 Agenda</h3>
              <ol className="agenda-list">
                {event.agenda.map((item, idx) => (
                  <li key={idx} className="agenda-item">
                    <div className="agenda-item__meta">
                      {item.day && (
                        <span className="agenda-item__day">{item.day}</span>
                      )}
                      <span className="agenda-item__time">
                        {formatTime(item.time.includes(':') ? item.time : item.time + ':00')}
                      </span>
                      {item.session && (
                        <span className="agenda-item__session">{item.session}</span>
                      )}
                    </div>
                    <p className="agenda-item__topic">{item.topic}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

        </article>

        {/* Panel lateral de información */}
        <aside className="detail-sidebar">

          <div className="info-card">
            <h3 className="info-card__title">Información del Evento</h3>

            <ul className="info-list">
              <li className="info-item">
                <span className="info-item__icon" aria-hidden="true">📅</span>
                <div>
                  <span className="info-item__label">Fecha</span>
                  <span className="info-item__value">
                    {getDayName(event.date)}, {formatDate(event.date)}
                  </span>
                </div>
              </li>
              <li className="info-item">
                <span className="info-item__icon" aria-hidden="true">🕐</span>
                <div>
                  <span className="info-item__label">Hora de inicio</span>
                  <span className="info-item__value">{formatTime(event.time)}</span>
                </div>
              </li>
              <li className="info-item">
                <span className="info-item__icon" aria-hidden="true">📍</span>
                <div>
                  <span className="info-item__label">Lugar</span>
                  <span className="info-item__value">{event.location}</span>
                </div>
              </li>
              <li className="info-item">
                <span className="info-item__icon" aria-hidden="true">🎤</span>
                <div>
                  <span className="info-item__label">Expositor</span>
                  <span className="info-item__value">{event.speaker}</span>
                  {event.speakerBio && (
                    <span className="info-item__bio">{event.speakerBio}</span>
                  )}
                </div>
              </li>
              <li className="info-item">
                <span className="info-item__icon" aria-hidden="true">💰</span>
                <div>
                  <span className="info-item__label">Costo de inscripción</span>
                  <span className={`info-item__value ${event.isFree ? 'text-success' : 'text-primary'}`}>
                    {event.isFree ? 'Gratuito' : `S/ ${event.cost.toFixed(2)}`}
                  </span>
                </div>
              </li>
            </ul>

            {/* Capacidad */}
            <div className="info-card__capacity">
              <div className="capacity-header">
                <span>Inscripciones</span>
                <span className="capacity-numbers">
                  <strong>{totalEnrolled}</strong> / {event.capacity}
                </span>
              </div>
              <div
                className="capacity-bar"
                role="progressbar"
                aria-valuenow={totalEnrolled}
                aria-valuemin={0}
                aria-valuemax={event.capacity}
              >
                <div
                  className="capacity-bar__fill"
                  style={{ width: `${fillPercent}%` }}
                />
              </div>
              {!past && (
                <p className="capacity-label">
                  {isFull
                    ? 'No hay cupos disponibles'
                    : `Quedan ${spotsLeft} cupo${spotsLeft !== 1 ? 's' : ''}`}
                </p>
              )}
            </div>

            {/* Botón de acción principal */}
            {!past && (
              <div className="info-card__action">
                {inscribed ? (
                  <>
                    <div className="inscription-confirm">
                      <span className="inscription-confirm__icon">✅</span>
                      <p>¡Estás inscrito en este evento!</p>
                    </div>
                    <button disabled={busy} onClick={handleCancel} className="btn btn--danger btn--block">
                      Cancelar inscripción
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleInscribe}
                    disabled={isFull || busy}
                    className="btn btn--primary btn--block"
                  >
                    {isFull ? 'Sin cupos disponibles' : 'Inscribirme en este evento'}
                  </button>
                )}
              </div>
            )}

            {past && (
              <div className="info-card__action">
                <p className="text-muted text-center">
                  Este evento ya fue realizado.
                </p>
              </div>
            )}
          </div>

        </aside>
      </div>
      <section className="detail-agenda">
        <h3 className="detail-section-title">Valoraciones {reviews && `· ${reviews.average ? reviews.average.toFixed(1) : '—'} / 5 · ${reviews.count}`}</h3>
        {reviewsLoading && <p role="status">Cargando valoraciones…</p>}
        {reviewsError && <div role="alert"><p>No se pudieron cargar las valoraciones. {reviewsError}</p><button className="btn btn--primary" onClick={() => setReviewsAttempt((attempt) => attempt + 1)}>Reintentar</button></div>}
        {!reviewsLoading && !reviewsError && reviews?.count === 0 && <p>Aún no hay valoraciones.</p>}
        {reviews?.reviews?.map((review, index) => <article key={`${review.createdAt}-${index}`}><strong>{review.author} · {review.rating}/5</strong><p>{review.comment}</p></article>)}
        {student ? <form onSubmit={submitReview} className="modal__body"><label className="form-label">Puntuación <select value={rating} onChange={(e) => setRating(e.target.value)}>{[1,2,3,4,5].map((n) => <option key={n} value={n}>{n}</option>)}</select></label><label className="form-label">Comentario<textarea required minLength="3" maxLength="1000" value={comment} onChange={(e) => setComment(e.target.value)} /></label><button className="btn btn--primary" disabled={busy}>Guardar valoración</button></form> : <p>Identifícate para dejar una valoración.</p>}
      </section>
    </div>
  )
}

export default EventDetail
