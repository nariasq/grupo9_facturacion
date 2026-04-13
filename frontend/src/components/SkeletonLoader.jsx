// ============================================================
// frontend/src/components/SkeletonLoader.jsx
// Componentes skeleton reutilizables con animación shimmer
// ============================================================
import React from 'react';

export function SkeletonText({ size = 'md' }) {
  return <div className={`skeleton skeleton-text skeleton-text--${size}`} />;
}

export function SkeletonCard() {
  return <div className="skeleton skeleton-card" />;
}

export function SkeletonCircle({ width = 36 }) {
  return <div className="skeleton skeleton-circle" style={{ width, height: width }} />;
}

export function SkeletonTableRow({ columns = 5 }) {
  return (
    <div className="skeleton-table-row">
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="skeleton skeleton-text" style={{ width: '100%' }} />
      ))}
    </div>
  );
}

export function SkeletonWidgets({ count = 4 }) {
  return (
    <div className="widgets-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton skeleton-card" style={{ height: 140 }} />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 5 }) {
  return (
    <div className="table-container">
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="skeleton skeleton-text skeleton-text--md" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonTableRow key={i} columns={columns} />
      ))}
    </div>
  );
}

export function SkeletonPage() {
  return (
    <div className="page-enter">
      <div style={{ marginBottom: 24 }}>
        <div className="skeleton skeleton-text skeleton-text--sm" style={{ height: 28 }} />
        <div className="skeleton skeleton-text skeleton-text--md" style={{ marginTop: 8 }} />
      </div>
      <SkeletonWidgets count={4} />
      <SkeletonTable rows={4} columns={5} />
    </div>
  );
}
