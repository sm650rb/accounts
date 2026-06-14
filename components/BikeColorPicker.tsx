'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { BIKE_COLORS, findBikeColor } from '@/lib/bike-colors';

interface BikeColorPickerProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export function BikeColorPicker({ id, value, onChange, required }: BikeColorPickerProps) {
  const fallbackId = useId();
  const fieldId = id ?? fallbackId;
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const selected = findBikeColor(value);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  function selectColor(name: string) {
    onChange(name);
    setOpen(false);
  }

  function clearSelection() {
    onChange('');
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        id={fieldId}
        className={`bike-color-trigger${selected ? ' is-selected' : ''}`}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {selected ? (
          <>
            <span className="bike-color-swatch" style={{ background: selected.swatch }} />
            <span className="bike-color-trigger-text">{selected.name}</span>
          </>
        ) : value ? (
          <>
            <span className="bike-color-swatch bike-color-swatch-legacy" />
            <span className="bike-color-trigger-text">{value}</span>
          </>
        ) : (
          <span className="bike-color-trigger-text bike-color-placeholder">
            {required ? 'Select bike colour *' : 'Select bike colour'}
          </span>
        )}
        <span className="bike-color-trigger-chevron" aria-hidden="true">
          ▾
        </span>
      </button>

      <input type="hidden" name="bike_color" value={value} aria-hidden="true" tabIndex={-1} />

      <dialog
        ref={dialogRef}
        className="bike-color-dialog"
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === dialogRef.current) setOpen(false);
        }}
      >
        <div className="bike-color-dialog-panel">
          <div className="bike-color-dialog-header">
            <h2>Choose your SM650 colour</h2>
            <button
              type="button"
              className="bike-color-dialog-close"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="bike-color-grid" role="listbox" aria-labelledby={fieldId}>
            {BIKE_COLORS.map((color) => {
              const isSelected = selected?.id === color.id;
              return (
                <button
                  key={color.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`bike-color-tile${isSelected ? ' is-selected' : ''}`}
                  onClick={() => selectColor(color.name)}
                >
                  <span className="bike-color-tile-image-wrap">
                    <img src={color.image} alt={color.name} loading="lazy" />
                    <span
                      className="bike-color-tile-swatch"
                      style={{ background: color.swatch }}
                      aria-hidden="true"
                    />
                  </span>
                  <span className="bike-color-tile-name">{color.name}</span>
                </button>
              );
            })}
          </div>

          {!required && value && (
            <div className="bike-color-dialog-footer">
              <button type="button" className="btn btn-ghost" onClick={clearSelection}>
                Clear selection
              </button>
            </div>
          )}
        </div>
      </dialog>
    </>
  );
}
