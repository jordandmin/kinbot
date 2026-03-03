/**
 * KinBot React Component Library
 * Served at /api/mini-apps/sdk/kinbot-components.js
 *
 * Ready-to-use React components that integrate with the KinBot design system.
 * All components use CSS variables from kinbot-sdk.css for automatic theme support.
 *
 * Usage in mini-apps:
 *   import { Card, Button, Input, Badge, Alert, Tabs, Modal, Spinner, Accordion, DropdownMenu, DataGrid, Panel, RadioGroup, Slider, DatePicker } from '@kinbot/components'
 */

import React, { useState, useEffect, useRef, useCallback, useId, createContext, useContext } from 'react'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

function mergeStyles(base, override) {
  return override ? { ...base, ...override } : base
}

// ─── Stack ────────────────────────────────────────────────────────────────────

/**
 * Flex container for vertical or horizontal layouts.
 * @param {{ direction?: 'row'|'column', gap?: string|number, align?: string, justify?: string, wrap?: boolean, className?: string, style?: object, children: any }} props
 */
export function Stack({ direction = 'column', gap = '0.75rem', align, justify, wrap, className, style, children, ...rest }) {
  return React.createElement('div', {
    className: cn('flex', className),
    style: mergeStyles({
      flexDirection: direction,
      gap: typeof gap === 'number' ? `${gap}px` : gap,
      alignItems: align,
      justifyContent: justify,
      flexWrap: wrap ? 'wrap' : undefined,
    }, style),
    ...rest,
  }, children)
}

// ─── Divider ──────────────────────────────────────────────────────────────────

/**
 * Horizontal or vertical separator line.
 * @param {{ orientation?: 'horizontal'|'vertical', className?: string, style?: object }} props
 */
export function Divider({ orientation = 'horizontal', className, style, ...rest }) {
  const isVertical = orientation === 'vertical'
  return React.createElement('div', {
    role: 'separator',
    'aria-orientation': orientation,
    className,
    style: mergeStyles({
      borderColor: 'var(--color-border)',
      ...(isVertical
        ? { borderLeft: '1px solid var(--color-border)', alignSelf: 'stretch', minHeight: '1rem' }
        : { borderTop: '1px solid var(--color-border)', width: '100%' }),
    }, style),
    ...rest,
  })
}

// ─── Card ─────────────────────────────────────────────────────────────────────

/**
 * Card container following the KinBot card design.
 * @param {{ hover?: boolean, className?: string, style?: object, children: any }} props
 */
export function Card({ hover, className, style, children, ...rest }) {
  return React.createElement('div', {
    className: cn('card', hover && 'card-hover', className),
    style,
    ...rest,
  }, children)
}

Card.Header = function CardHeader({ className, style, children, ...rest }) {
  return React.createElement('div', { className: cn('card-header', className), style, ...rest }, children)
}

Card.Title = function CardTitle({ className, style, children, as = 'h3', ...rest }) {
  return React.createElement(as, { className: cn('card-title', className), style, ...rest }, children)
}

Card.Description = function CardDescription({ className, style, children, ...rest }) {
  return React.createElement('p', { className: cn('card-description', className), style, ...rest }, children)
}

Card.Content = function CardContent({ className, style, children, ...rest }) {
  return React.createElement('div', { className: cn('card-content', className), style, ...rest }, children)
}

Card.Footer = function CardFooter({ className, style, children, ...rest }) {
  return React.createElement('div', { className: cn('card-footer', className), style, ...rest }, children)
}

// ─── Button ───────────────────────────────────────────────────────────────────

/**
 * Themed button with variants.
 * @param {{ variant?: 'primary'|'secondary'|'destructive'|'ghost'|'shine', size?: 'sm'|'md'|'lg'|'icon', disabled?: boolean, className?: string, onClick?: Function, children: any }} props
 */
export function Button({ variant = 'primary', size = 'md', disabled, className, children, ...rest }) {
  const variantClass = variant === 'md' ? '' : `btn-${variant}`
  const sizeClass = size === 'md' ? '' : `btn-${size}`
  return React.createElement('button', {
    className: cn('btn', variantClass, sizeClass, className),
    disabled,
    ...rest,
  }, children)
}

// ─── ButtonGroup ──────────────────────────────────────────────────────────────

/**
 * Group buttons together with proper spacing.
 * @param {{ className?: string, style?: object, children: any }} props
 */
export function ButtonGroup({ className, style, children, ...rest }) {
  return React.createElement('div', {
    className: cn('inline-flex', className),
    style: mergeStyles({ gap: '0.5rem' }, style),
    role: 'group',
    ...rest,
  }, children)
}

// ─── Input ────────────────────────────────────────────────────────────────────

/**
 * Text input field.
 * @param {{ label?: string, error?: string, className?: string }} props
 */
export const Input = React.forwardRef(function Input({ label, error, className, id: propId, style, ...rest }, ref) {
  const autoId = useId()
  const id = propId || autoId
  return React.createElement('div', { style: mergeStyles({ display: 'flex', flexDirection: 'column', gap: '0.375rem' }, style) },
    label && React.createElement('label', { htmlFor: id, className: 'label' }, label),
    React.createElement('input', {
      ref,
      id,
      className: cn('input', error && 'border-destructive', className),
      'aria-invalid': error ? 'true' : undefined,
      'aria-describedby': error ? `${id}-error` : undefined,
      ...rest,
    }),
    error && React.createElement('p', {
      id: `${id}-error`,
      style: { color: 'var(--color-destructive)', fontSize: '0.8125rem', margin: 0 },
    }, error),
  )
})

// ─── Textarea ─────────────────────────────────────────────────────────────────

/**
 * Textarea field.
 * @param {{ label?: string, error?: string, className?: string }} props
 */
export const Textarea = React.forwardRef(function Textarea({ label, error, className, id: propId, style, ...rest }, ref) {
  const autoId = useId()
  const id = propId || autoId
  return React.createElement('div', { style: mergeStyles({ display: 'flex', flexDirection: 'column', gap: '0.375rem' }, style) },
    label && React.createElement('label', { htmlFor: id, className: 'label' }, label),
    React.createElement('textarea', {
      ref,
      id,
      className: cn('textarea', error && 'border-destructive', className),
      'aria-invalid': error ? 'true' : undefined,
      ...rest,
    }),
    error && React.createElement('p', {
      style: { color: 'var(--color-destructive)', fontSize: '0.8125rem', margin: 0 },
    }, error),
  )
})

// ─── Select ───────────────────────────────────────────────────────────────────

/**
 * Native select field styled to match KinBot.
 * @param {{ label?: string, options: Array<{value: string, label: string}>, placeholder?: string, error?: string, className?: string }} props
 */
export const Select = React.forwardRef(function Select({ label, options = [], placeholder, error, className, id: propId, style, ...rest }, ref) {
  const autoId = useId()
  const id = propId || autoId
  return React.createElement('div', { style: mergeStyles({ display: 'flex', flexDirection: 'column', gap: '0.375rem' }, style) },
    label && React.createElement('label', { htmlFor: id, className: 'label' }, label),
    React.createElement('select', {
      ref,
      id,
      className: cn('input', className),
      'aria-invalid': error ? 'true' : undefined,
      ...rest,
    },
      placeholder && React.createElement('option', { value: '', disabled: true }, placeholder),
      ...options.map(opt =>
        React.createElement('option', { key: opt.value, value: opt.value }, opt.label)
      ),
    ),
    error && React.createElement('p', {
      style: { color: 'var(--color-destructive)', fontSize: '0.8125rem', margin: 0 },
    }, error),
  )
})

// ─── Checkbox ─────────────────────────────────────────────────────────────────

/**
 * Checkbox with label.
 * @param {{ label?: string, checked?: boolean, onChange?: Function, className?: string }} props
 */
export function Checkbox({ label, className, id: propId, style, ...rest }) {
  const autoId = useId()
  const id = propId || autoId
  return React.createElement('div', {
    className: cn('inline-flex', className),
    style: mergeStyles({ alignItems: 'center', gap: '0.5rem' }, style),
  },
    React.createElement('input', {
      type: 'checkbox',
      id,
      style: { width: '1rem', height: '1rem', accentColor: 'var(--color-primary)', cursor: 'pointer' },
      ...rest,
    }),
    label && React.createElement('label', {
      htmlFor: id,
      style: { cursor: 'pointer', fontSize: '0.875rem', color: 'var(--color-foreground)' },
    }, label),
  )
}

// ─── Switch ───────────────────────────────────────────────────────────────────

const switchTrackStyle = (checked) => ({
  position: 'relative',
  width: '2.5rem',
  height: '1.375rem',
  borderRadius: 'var(--radius-full)',
  backgroundColor: checked ? 'var(--color-primary)' : 'var(--color-muted)',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  border: 'none',
  padding: 0,
  flexShrink: 0,
})

const switchThumbStyle = (checked) => ({
  position: 'absolute',
  top: '2px',
  left: checked ? '1.25rem' : '2px',
  width: '1.125rem',
  height: '1.125rem',
  borderRadius: 'var(--radius-full)',
  backgroundColor: 'white',
  transition: 'left 0.2s',
  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
})

/**
 * Toggle switch.
 * @param {{ label?: string, checked?: boolean, onChange?: Function, disabled?: boolean }} props
 */
export function Switch({ label, checked = false, onChange, disabled, className, style, ...rest }) {
  const autoId = useId()
  return React.createElement('div', {
    className: cn('inline-flex', className),
    style: mergeStyles({ alignItems: 'center', gap: '0.5rem' }, style),
  },
    React.createElement('button', {
      type: 'button',
      role: 'switch',
      'aria-checked': checked,
      disabled,
      onClick: () => onChange && onChange(!checked),
      style: mergeStyles(switchTrackStyle(checked), disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
      ...rest,
    },
      React.createElement('span', { style: switchThumbStyle(checked) }),
    ),
    label && React.createElement('label', {
      style: { cursor: disabled ? 'not-allowed' : 'pointer', fontSize: '0.875rem', color: 'var(--color-foreground)' },
      onClick: () => !disabled && onChange && onChange(!checked),
    }, label),
  )
}

// ─── Badge ────────────────────────────────────────────────────────────────────

/**
 * Inline badge/tag.
 * @param {{ variant?: 'default'|'primary'|'destructive'|'success'|'warning'|'outline', className?: string, children: any }} props
 */
export function Badge({ variant = 'default', className, children, ...rest }) {
  const variantClass = variant === 'default' ? '' : `badge-${variant}`
  return React.createElement('span', {
    className: cn('badge', variantClass, className),
    ...rest,
  }, children)
}

// ─── Tag ──────────────────────────────────────────────────────────────────────

/**
 * Removable tag (extends Badge with close button).
 * @param {{ onRemove?: Function, variant?: string, className?: string, children: any }} props
 */
export function Tag({ onRemove, variant, className, children, ...rest }) {
  return React.createElement(Badge, { variant, className: cn(className), ...rest },
    children,
    onRemove && React.createElement('button', {
      type: 'button',
      onClick: onRemove,
      'aria-label': 'Remove',
      style: { marginLeft: '0.25rem', cursor: 'pointer', background: 'none', border: 'none', padding: 0, color: 'inherit', fontSize: '1rem', lineHeight: 1 },
    }, '\u00d7'),
  )
}

// ─── Stat ─────────────────────────────────────────────────────────────────────

/**
 * Stat display (number + label).
 * @param {{ value: string|number, label: string, trend?: string, trendUp?: boolean, className?: string }} props
 */
export function Stat({ value, label, trend, trendUp, className, style, ...rest }) {
  return React.createElement('div', {
    className,
    style: mergeStyles({ textAlign: 'center', padding: '0.5rem' }, style),
    ...rest,
  },
    React.createElement('div', {
      style: { fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-foreground)', lineHeight: 1.2 },
    }, value),
    React.createElement('div', {
      style: { fontSize: '0.8125rem', color: 'var(--color-muted-foreground)', marginTop: '0.25rem' },
    }, label),
    trend && React.createElement('div', {
      style: { fontSize: '0.75rem', marginTop: '0.25rem', color: trendUp ? 'var(--color-success)' : 'var(--color-destructive)' },
    }, trend),
  )
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

/**
 * Avatar circle (image or initials fallback).
 * @param {{ src?: string, alt?: string, initials?: string, size?: number, className?: string }} props
 */
export function Avatar({ src, alt = '', initials, size = 40, className, style, ...rest }) {
  const baseStyle = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: 'var(--radius-full)',
    overflow: 'hidden',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--color-muted)',
    color: 'var(--color-muted-foreground)',
    fontWeight: 600,
    fontSize: `${size * 0.4}px`,
    flexShrink: 0,
  }

  if (src) {
    return React.createElement('img', {
      src,
      alt,
      className,
      style: mergeStyles(baseStyle, style),
      ...rest,
    })
  }

  return React.createElement('div', {
    className,
    style: mergeStyles(baseStyle, style),
    'aria-label': alt || initials,
    ...rest,
  }, initials || (alt ? alt.charAt(0).toUpperCase() : '?'))
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────

/**
 * Simple tooltip on hover.
 * @param {{ text: string, position?: 'top'|'bottom'|'left'|'right', children: any }} props
 */
export function Tooltip({ text, position = 'top', children, className, ...rest }) {
  const [show, setShow] = useState(false)
  const posStyles = {
    top: { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '6px' },
    bottom: { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '6px' },
    left: { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '6px' },
    right: { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: '6px' },
  }

  return React.createElement('div', {
    className,
    style: { position: 'relative', display: 'inline-flex' },
    onMouseEnter: () => setShow(true),
    onMouseLeave: () => setShow(false),
    onFocus: () => setShow(true),
    onBlur: () => setShow(false),
    ...rest,
  },
    children,
    show && React.createElement('div', {
      role: 'tooltip',
      style: {
        position: 'absolute',
        ...posStyles[position],
        padding: '0.375rem 0.625rem',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--color-foreground)',
        color: 'var(--color-background)',
        fontSize: '0.75rem',
        whiteSpace: 'nowrap',
        zIndex: 50,
        pointerEvents: 'none',
        animation: 'fade-in 0.15s ease-out',
      },
    }, text),
  )
}

// ─── ProgressBar ──────────────────────────────────────────────────────────────

/**
 * Animated progress bar.
 * @param {{ value: number, max?: number, color?: string, height?: number, showLabel?: boolean, className?: string }} props
 */
export function ProgressBar({ value = 0, max = 100, color, height = 8, showLabel, className, style, ...rest }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return React.createElement('div', {
    className,
    style: mergeStyles({ width: '100%' }, style),
    ...rest,
  },
    showLabel && React.createElement('div', {
      style: { fontSize: '0.75rem', color: 'var(--color-muted-foreground)', marginBottom: '0.25rem', textAlign: 'right' },
    }, `${Math.round(pct)}%`),
    React.createElement('div', {
      role: 'progressbar',
      'aria-valuenow': value,
      'aria-valuemin': 0,
      'aria-valuemax': max,
      style: {
        width: '100%',
        height: `${height}px`,
        borderRadius: 'var(--radius-full)',
        backgroundColor: 'var(--color-muted)',
        overflow: 'hidden',
      },
    },
      React.createElement('div', {
        style: {
          width: `${pct}%`,
          height: '100%',
          borderRadius: 'var(--radius-full)',
          backgroundColor: color || 'var(--color-primary)',
          transition: 'width 0.3s ease',
        },
      }),
    ),
  )
}

// ─── Alert ────────────────────────────────────────────────────────────────────

const alertStyles = {
  info: { bg: 'var(--color-info)', fg: 'var(--color-info-foreground)', border: 'var(--color-info)' },
  success: { bg: 'var(--color-success)', fg: 'var(--color-success-foreground)', border: 'var(--color-success)' },
  warning: { bg: 'var(--color-warning)', fg: 'var(--color-warning-foreground)', border: 'var(--color-warning)' },
  error: { bg: 'var(--color-destructive)', fg: 'var(--color-destructive-foreground)', border: 'var(--color-destructive)' },
}

/**
 * Alert banner.
 * @param {{ variant?: 'info'|'success'|'warning'|'error', title?: string, dismissible?: boolean, onDismiss?: Function, className?: string, children: any }} props
 */
export function Alert({ variant = 'info', title, dismissible, onDismiss, className, style, children, ...rest }) {
  const colors = alertStyles[variant] || alertStyles.info
  return React.createElement('div', {
    role: 'alert',
    className,
    style: mergeStyles({
      padding: '0.75rem 1rem',
      borderRadius: 'var(--radius-lg)',
      borderLeft: `4px solid ${colors.border}`,
      backgroundColor: `color-mix(in oklch, ${colors.bg} 12%, transparent)`,
      color: 'var(--color-foreground)',
    }, style),
    ...rest,
  },
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } },
      React.createElement('div', null,
        title && React.createElement('div', {
          style: { fontWeight: 600, marginBottom: '0.25rem' },
        }, title),
        React.createElement('div', {
          style: { fontSize: '0.875rem' },
        }, children),
      ),
      dismissible && React.createElement('button', {
        type: 'button',
        onClick: onDismiss,
        'aria-label': 'Dismiss',
        style: { background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: 'var(--color-muted-foreground)', fontSize: '1.125rem' },
      }, '\u00d7'),
    ),
  )
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

/**
 * Loading spinner.
 * @param {{ size?: number, color?: string, className?: string }} props
 */
export function Spinner({ size = 24, color, className, style, ...rest }) {
  return React.createElement('div', {
    role: 'status',
    'aria-label': 'Loading',
    className,
    style: mergeStyles({
      width: `${size}px`,
      height: `${size}px`,
      border: `2px solid var(--color-muted)`,
      borderTopColor: color || 'var(--color-primary)',
      borderRadius: '50%',
      animation: 'spin 0.6s linear infinite',
      display: 'inline-block',
    }, style),
    ...rest,
  })
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

/**
 * Skeleton loading placeholder.
 * @param {{ width?: string, height?: string, rounded?: boolean, circle?: boolean, className?: string }} props
 */
export function Skeleton({ width = '100%', height = '1rem', rounded, circle, className, style, ...rest }) {
  return React.createElement('div', {
    className: cn('skeleton', className),
    style: mergeStyles({
      width: circle ? height : width,
      height,
      borderRadius: circle ? '50%' : rounded ? 'var(--radius-lg)' : 'var(--radius-md)',
    }, style),
    ...rest,
  })
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

/**
 * Empty state placeholder.
 * @param {{ icon?: string, title: string, description?: string, action?: any, className?: string }} props
 */
export function EmptyState({ icon, title, description, action, className, style, ...rest }) {
  return React.createElement('div', {
    className,
    style: mergeStyles({
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
      gap: '0.75rem',
    }, style),
    ...rest,
  },
    icon && React.createElement('div', {
      style: { fontSize: '2.5rem' },
    }, icon),
    React.createElement('div', {
      style: { fontWeight: 600, color: 'var(--color-foreground)', fontSize: '1rem' },
    }, title),
    description && React.createElement('div', {
      style: { color: 'var(--color-muted-foreground)', fontSize: '0.875rem', maxWidth: '24rem' },
    }, description),
    action,
  )
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

/**
 * Tab navigation.
 * @param {{ tabs: Array<{id: string, label: string, icon?: string}>, active: string, onChange: Function, className?: string }} props
 */
export function Tabs({ tabs = [], active, onChange, className, style, ...rest }) {
  return React.createElement('div', {
    role: 'tablist',
    className,
    style: mergeStyles({
      display: 'flex',
      gap: '0.25rem',
      borderBottom: '1px solid var(--color-border)',
      paddingBottom: 0,
    }, style),
    ...rest,
  },
    ...tabs.map(tab =>
      React.createElement('button', {
        key: tab.id,
        role: 'tab',
        'aria-selected': active === tab.id,
        onClick: () => onChange(tab.id),
        style: {
          padding: '0.5rem 1rem',
          fontSize: '0.875rem',
          fontWeight: active === tab.id ? 600 : 400,
          color: active === tab.id ? 'var(--color-primary)' : 'var(--color-muted-foreground)',
          background: 'none',
          border: 'none',
          borderBottom: active === tab.id ? '2px solid var(--color-primary)' : '2px solid transparent',
          cursor: 'pointer',
          transition: 'color 0.15s, border-color 0.15s',
          marginBottom: '-1px',
        },
      }, tab.icon ? `${tab.icon} ${tab.label}` : tab.label),
    ),
  )
}

// ─── Table ────────────────────────────────────────────────────────────────────

/**
 * Data table using the CSS `.table` class.
 * @param {{ columns: Array<{key: string, label: string, align?: string, render?: Function}>, data: Array<object>, onRowClick?: Function, className?: string }} props
 */
export function Table({ columns = [], data = [], onRowClick, className, style, ...rest }) {
  return React.createElement('div', { style: mergeStyles({ overflowX: 'auto' }, style) },
    React.createElement('table', {
      className: cn('table', className),
      ...rest,
    },
      React.createElement('thead', null,
        React.createElement('tr', null,
          ...columns.map(col =>
            React.createElement('th', {
              key: col.key,
              style: col.align ? { textAlign: col.align } : undefined,
            }, col.label),
          ),
        ),
      ),
      React.createElement('tbody', null,
        ...data.map((row, i) =>
          React.createElement('tr', {
            key: row.id ?? i,
            onClick: onRowClick ? () => onRowClick(row, i) : undefined,
            style: onRowClick ? { cursor: 'pointer' } : undefined,
          },
            ...columns.map(col =>
              React.createElement('td', {
                key: col.key,
                style: col.align ? { textAlign: col.align } : undefined,
              }, col.render ? col.render(row[col.key], row, i) : row[col.key]),
            ),
          ),
        ),
      ),
    ),
  )
}

// ─── List ─────────────────────────────────────────────────────────────────────

/**
 * Simple styled list.
 * @param {{ items: Array<{id?: string, content: any, onClick?: Function}>, divided?: boolean, className?: string }} props
 */
export function List({ items = [], divided = true, className, style, ...rest }) {
  return React.createElement('div', {
    className,
    role: 'list',
    style: mergeStyles({
      display: 'flex',
      flexDirection: 'column',
    }, style),
    ...rest,
  },
    ...items.map((item, i) =>
      React.createElement('div', {
        key: item.id ?? i,
        role: 'listitem',
        onClick: item.onClick,
        style: {
          padding: '0.625rem 0',
          borderBottom: divided && i < items.length - 1 ? '1px solid var(--color-border)' : undefined,
          cursor: item.onClick ? 'pointer' : undefined,
        },
      }, item.content),
    ),
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────

/**
 * Page navigation.
 * @param {{ page: number, totalPages: number, onChange: Function, className?: string }} props
 */
export function Pagination({ page = 1, totalPages = 1, onChange, className, style, ...rest }) {
  const pages = []
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
      pages.push(p)
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...')
    }
  }

  return React.createElement('div', {
    className,
    style: mergeStyles({ display: 'flex', alignItems: 'center', gap: '0.25rem' }, style),
    'aria-label': 'Pagination',
    ...rest,
  },
    React.createElement('button', {
      className: 'btn btn-ghost btn-sm',
      disabled: page <= 1,
      onClick: () => onChange(page - 1),
      'aria-label': 'Previous page',
    }, '\u2190'),
    ...pages.map((p, i) =>
      p === '...'
        ? React.createElement('span', { key: `e${i}`, style: { padding: '0 0.25rem', color: 'var(--color-muted-foreground)' } }, '...')
        : React.createElement('button', {
            key: p,
            className: cn('btn btn-sm', p === page ? 'btn-primary' : 'btn-ghost'),
            onClick: () => onChange(p),
            'aria-current': p === page ? 'page' : undefined,
          }, p),
    ),
    React.createElement('button', {
      className: 'btn btn-ghost btn-sm',
      disabled: page >= totalPages,
      onClick: () => onChange(page + 1),
      'aria-label': 'Next page',
    }, '\u2192'),
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

/**
 * Modal dialog (renders in the iframe, not the parent).
 * For parent-level dialogs, use KinBot.confirm() or KinBot.prompt() from the SDK.
 * @param {{ open: boolean, onClose: Function, title?: string, size?: 'sm'|'md'|'lg', children: any }} props
 */
export function Modal({ open, onClose, title, size = 'md', className, children, ...rest }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const handleEsc = (e) => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [open, onClose])

  if (!open) return null

  const maxWidths = { sm: '24rem', md: '32rem', lg: '48rem' }

  return React.createElement('div', {
    ref: dialogRef,
    role: 'dialog',
    'aria-modal': 'true',
    'aria-label': title,
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    },
    ...rest,
  },
    // Backdrop
    React.createElement('div', {
      onClick: onClose,
      style: {
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        animation: 'fade-in 0.15s ease-out',
      },
    }),
    // Panel
    React.createElement('div', {
      className: cn('card', className),
      style: {
        position: 'relative',
        width: '100%',
        maxWidth: maxWidths[size],
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        animation: 'scale-in 0.2s ease-out',
      },
    },
      title && React.createElement('div', { className: 'card-header', style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
        React.createElement('h3', { className: 'card-title', style: { margin: 0 } }, title),
        React.createElement('button', {
          type: 'button',
          onClick: onClose,
          'aria-label': 'Close',
          style: { background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: 'var(--color-muted-foreground)', fontSize: '1.25rem' },
        }, '\u00d7'),
      ),
      React.createElement('div', { className: 'card-content', style: { overflowY: 'auto', flex: 1 } }, children),
    ),
  )
}

// ─── Drawer ───────────────────────────────────────────────────────────────────

/**
 * Slide-in drawer panel.
 * @param {{ open: boolean, onClose: Function, title?: string, side?: 'left'|'right', width?: string, children: any }} props
 */
export function Drawer({ open, onClose, title, side = 'right', width = '24rem', className, children, ...rest }) {
  useEffect(() => {
    if (!open) return
    const handleEsc = (e) => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [open, onClose])

  if (!open) return null

  const isLeft = side === 'left'

  return React.createElement('div', {
    role: 'dialog',
    'aria-modal': 'true',
    'aria-label': title,
    style: { position: 'fixed', inset: 0, zIndex: 100, display: 'flex' },
    ...rest,
  },
    React.createElement('div', {
      onClick: onClose,
      style: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', animation: 'fade-in 0.15s ease-out' },
    }),
    React.createElement('div', {
      className: cn('card', className),
      style: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        [isLeft ? 'left' : 'right']: 0,
        width,
        maxWidth: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 0,
        animation: `slide-in-${side} 0.2s ease-out`,
      },
    },
      title && React.createElement('div', { className: 'card-header', style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
        React.createElement('h3', { className: 'card-title', style: { margin: 0 } }, title),
        React.createElement('button', {
          type: 'button',
          onClick: onClose,
          'aria-label': 'Close',
          style: { background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: 'var(--color-muted-foreground)', fontSize: '1.25rem' },
        }, '\u00d7'),
      ),
      React.createElement('div', { className: 'card-content', style: { overflowY: 'auto', flex: 1 } }, children),
    ),
  )
}

// ─── Grid ─────────────────────────────────────────────────────────────────────

/**
 * CSS Grid layout with responsive column support.
 * @param {{ columns?: number|string, minChildWidth?: string, gap?: string|number, rowGap?: string|number, colGap?: string|number, className?: string, style?: object, children: any }} props
 *
 * Usage:
 *   <Grid columns={3} gap="1rem">...</Grid>
 *   <Grid minChildWidth="250px">...</Grid>  // auto-fit responsive
 */
export function Grid({ columns, minChildWidth, gap = '1rem', rowGap, colGap, className, style, children, ...rest }) {
  const gapVal = typeof gap === 'number' ? `${gap}px` : gap
  let gridTemplateColumns
  if (minChildWidth) {
    gridTemplateColumns = `repeat(auto-fit, minmax(${minChildWidth}, 1fr))`
  } else if (typeof columns === 'number') {
    gridTemplateColumns = `repeat(${columns}, 1fr)`
  } else if (typeof columns === 'string') {
    gridTemplateColumns = columns
  } else {
    gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))'
  }
  return React.createElement('div', {
    className,
    style: mergeStyles({
      display: 'grid',
      gridTemplateColumns,
      gap: (!rowGap && !colGap) ? gapVal : undefined,
      rowGap: rowGap ? (typeof rowGap === 'number' ? `${rowGap}px` : rowGap) : undefined,
      columnGap: colGap ? (typeof colGap === 'number' ? `${colGap}px` : colGap) : undefined,
    }, style),
    ...rest,
  }, children)
}

/**
 * Grid item with optional span control.
 * @param {{ colSpan?: number, rowSpan?: number, className?: string, style?: object, children: any }} props
 */
Grid.Item = function GridItem({ colSpan, rowSpan, className, style, children, ...rest }) {
  return React.createElement('div', {
    className,
    style: mergeStyles({
      gridColumn: colSpan ? `span ${colSpan}` : undefined,
      gridRow: rowSpan ? `span ${rowSpan}` : undefined,
    }, style),
    ...rest,
  }, children)
}

// ─── Breadcrumbs ──────────────────────────────────────────────────────────────

/**
 * Breadcrumb navigation.
 * @param {{ items: Array<{label: string, href?: string, onClick?: function}>, separator?: string, className?: string, style?: object }} props
 */
export function Breadcrumbs({ items = [], separator = '/', className, style, ...rest }) {
  return React.createElement('nav', {
    'aria-label': 'Breadcrumb',
    className,
    style: mergeStyles({ fontSize: '0.875rem' }, style),
    ...rest,
  },
    React.createElement('ol', {
      style: { display: 'flex', alignItems: 'center', gap: '0.375rem', listStyle: 'none', margin: 0, padding: 0, flexWrap: 'wrap' },
    },
      items.map((item, i) => {
        const isLast = i === items.length - 1
        const elements = []
        if (i > 0) {
          elements.push(React.createElement('li', {
            key: `sep-${i}`,
            'aria-hidden': 'true',
            style: { color: 'var(--color-muted-foreground)', userSelect: 'none' },
          }, separator))
        }
        const linkStyle = isLast
          ? { color: 'var(--color-foreground)', fontWeight: 500, cursor: 'default', textDecoration: 'none' }
          : { color: 'var(--color-muted-foreground)', textDecoration: 'none', cursor: 'pointer' }
        const el = (item.href && !isLast)
          ? React.createElement('a', { href: item.href, style: linkStyle }, item.label)
          : React.createElement('span', {
              style: linkStyle,
              role: (!isLast && item.onClick) ? 'button' : undefined,
              tabIndex: (!isLast && item.onClick) ? 0 : undefined,
              onClick: !isLast ? item.onClick : undefined,
              onKeyDown: (!isLast && item.onClick) ? e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); item.onClick(e) } } : undefined,
            }, item.label)
        elements.push(React.createElement('li', {
          key: `item-${i}`,
          'aria-current': isLast ? 'page' : undefined,
        }, el))
        return elements
      }).flat(),
    ),
  )
}

// ─── Popover ──────────────────────────────────────────────────────────────────

/**
 * Popover attached to a trigger element. Toggles on click, closes on outside click or Escape.
 * @param {{ trigger: any, content: any, placement?: 'top'|'bottom'|'left'|'right', open?: boolean, onOpenChange?: function, className?: string, style?: object }} props
 */
export function Popover({ trigger, content, placement = 'bottom', open: controlledOpen, onOpenChange, className, style, ...rest }) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen
  const setOpen = useCallback((v) => {
    if (!isControlled) setInternalOpen(v)
    if (onOpenChange) onOpenChange(v)
  }, [isControlled, onOpenChange])
  const containerRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    function handleEsc(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen, setOpen])

  const placementStyles = {
    top: { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '0.5rem' },
    bottom: { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '0.5rem' },
    left: { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '0.5rem' },
    right: { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: '0.5rem' },
  }

  return React.createElement('div', {
    ref: containerRef,
    style: mergeStyles({ position: 'relative', display: 'inline-block' }, style),
    ...rest,
  },
    React.createElement('div', {
      onClick: () => setOpen(!isOpen),
      style: { cursor: 'pointer' },
    }, trigger),
    isOpen && React.createElement('div', {
      role: 'dialog',
      className: cn('card', className),
      style: {
        position: 'absolute',
        zIndex: 50,
        minWidth: '12rem',
        padding: '0.75rem',
        animation: 'fade-in 0.15s ease-out',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        ...placementStyles[placement] || placementStyles.bottom,
      },
    }, content),
  )
}

// ─── Form ─────────────────────────────────────────────────────────────────────

const FormContext = createContext(null)

/**
 * Built-in validation rules.
 * Each rule is a function (value, param?) => string|null (null = valid).
 */
const validators = {
  required: (v) => {
    if (v === undefined || v === null || v === '' || (typeof v === 'boolean' && !v)) return 'This field is required'
    return null
  },
  email: (v) => {
    if (!v) return null // let required handle empty
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Invalid email address'
  },
  minLength: (v, min) => {
    if (!v) return null
    return String(v).length >= min ? null : `Must be at least ${min} characters`
  },
  maxLength: (v, max) => {
    if (!v) return null
    return String(v).length <= max ? null : `Must be at most ${max} characters`
  },
  min: (v, min) => {
    if (v === '' || v === undefined || v === null) return null
    return Number(v) >= min ? null : `Must be at least ${min}`
  },
  max: (v, max) => {
    if (v === '' || v === undefined || v === null) return null
    return Number(v) <= max ? null : `Must be at most ${max}`
  },
  pattern: (v, regex) => {
    if (!v) return null
    const re = typeof regex === 'string' ? new RegExp(regex) : regex
    return re.test(v) ? null : 'Invalid format'
  },
  match: (v, _param, allValues, fieldName) => {
    if (!v) return null
    return v === allValues[_param] ? null : `Must match ${_param}`
  },
}

function runValidation(value, rules, allValues, fieldName) {
  if (!rules) return null
  for (const rule of rules) {
    let msg = null
    if (typeof rule === 'string') {
      // shorthand: "required", "email"
      if (validators[rule]) msg = validators[rule](value)
    } else if (typeof rule === 'function') {
      // custom: (value, allValues) => string|null
      msg = rule(value, allValues)
    } else if (typeof rule === 'object' && rule.type) {
      // { type: 'minLength', value: 3, message?: 'Too short' }
      const fn = validators[rule.type]
      if (fn) {
        msg = fn(value, rule.value, allValues, fieldName)
        if (msg && rule.message) msg = rule.message
      }
    }
    if (msg) return msg
  }
  return null
}

/**
 * Form component with validation support.
 *
 * @param {{
 *   onSubmit: (values: object) => void|Promise<void>,
 *   initialValues?: object,
 *   validateOnChange?: boolean,
 *   validateOnBlur?: boolean,
 *   className?: string,
 *   style?: object,
 *   children: any
 * }} props
 *
 * Usage:
 *   <Form onSubmit={vals => console.log(vals)} initialValues={{ name: '' }}>
 *     <Form.Field name="name" label="Name" rules={['required', { type: 'minLength', value: 2 }]}>
 *       <Input />
 *     </Form.Field>
 *     <Form.Field name="email" label="Email" rules={['required', 'email']}>
 *       <Input type="email" />
 *     </Form.Field>
 *     <Form.Actions>
 *       <Button type="submit">Submit</Button>
 *       <Form.Reset variant="ghost">Reset</Form.Reset>
 *     </Form.Actions>
 *   </Form>
 *
 * The child of Form.Field receives: value, onChange, onBlur, error, id props automatically.
 * For custom inputs, ensure they accept these props.
 */
export function Form({ onSubmit, initialValues = {}, validateOnChange = false, validateOnBlur = true, className, style, children, ...rest }) {
  const [values, setValues] = useState(() => ({ ...initialValues }))
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const fieldsRef = useRef({}) // { name: { rules } }

  const registerField = useCallback((name, rules) => {
    fieldsRef.current[name] = { rules }
  }, [])

  const unregisterField = useCallback((name) => {
    delete fieldsRef.current[name]
  }, [])

  const setValue = useCallback((name, val) => {
    setValues(prev => {
      const next = { ...prev, [name]: val }
      return next
    })
  }, [])

  const setFieldError = useCallback((name, error) => {
    setErrors(prev => {
      if (prev[name] === error) return prev
      const next = { ...prev }
      if (error) next[name] = error; else delete next[name]
      return next
    })
  }, [])

  const validateField = useCallback((name, currentValues) => {
    const field = fieldsRef.current[name]
    if (!field) return null
    const error = runValidation(currentValues[name], field.rules, currentValues, name)
    setFieldError(name, error)
    return error
  }, [setFieldError])

  const validateAll = useCallback((currentValues) => {
    const newErrors = {}
    let hasError = false
    for (const name of Object.keys(fieldsRef.current)) {
      const error = runValidation(currentValues[name], fieldsRef.current[name].rules, currentValues, name)
      if (error) {
        newErrors[name] = error
        hasError = true
      }
    }
    setErrors(newErrors)
    return !hasError
  }, [])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    setSubmitted(true)
    // Touch all fields
    const allTouched = {}
    for (const name of Object.keys(fieldsRef.current)) allTouched[name] = true
    setTouched(allTouched)

    const currentValues = { ...values }
    if (!validateAll(currentValues)) return

    setSubmitting(true)
    try {
      await onSubmit?.(currentValues)
    } finally {
      setSubmitting(false)
    }
  }, [values, validateAll, onSubmit])

  const reset = useCallback(() => {
    setValues({ ...initialValues })
    setErrors({})
    setTouched({})
    setSubmitted(false)
    setSubmitting(false)
  }, [initialValues])

  const ctx = {
    values, errors, touched, submitting, submitted,
    setValue, setFieldError, validateField, registerField, unregisterField,
    setTouched, validateOnChange, validateOnBlur, reset,
  }

  return React.createElement(FormContext.Provider, { value: ctx },
    React.createElement('form', {
      onSubmit: handleSubmit,
      noValidate: true,
      className,
      style,
      ...rest,
    }, typeof children === 'function' ? children({ values, errors, submitting, submitted, reset }) : children),
  )
}

/**
 * Form field wrapper with automatic validation binding.
 * Clones the child element and injects value/onChange/onBlur/error/id props.
 *
 * @param {{
 *   name: string,
 *   label?: string,
 *   rules?: Array<string | Function | {type: string, value?: any, message?: string}>,
 *   helpText?: string,
 *   children: ReactElement
 * }} props
 */
Form.Field = function FormField({ name, label, rules, helpText, children, style, ...rest }) {
  const ctx = useContext(FormContext)
  const autoId = useId()
  const id = `field-${name}-${autoId}`

  useEffect(() => {
    ctx.registerField(name, rules)
    return () => ctx.unregisterField(name)
  }, [name, rules])

  const value = ctx.values[name] ?? ''
  const error = (ctx.touched[name] || ctx.submitted) ? ctx.errors[name] : undefined

  const handleChange = useCallback((eOrVal) => {
    let val
    if (eOrVal && eOrVal.target) {
      const t = eOrVal.target
      val = t.type === 'checkbox' ? t.checked : t.value
    } else {
      val = eOrVal
    }
    ctx.setValue(name, val)
    if (ctx.validateOnChange || ctx.submitted) {
      // Validate after state update via setTimeout
      setTimeout(() => {
        ctx.validateField(name, { ...ctx.values, [name]: val })
      }, 0)
    }
  }, [name, ctx])

  const handleBlur = useCallback(() => {
    ctx.setTouched(prev => ({ ...prev, [name]: true }))
    if (ctx.validateOnBlur) {
      ctx.validateField(name, ctx.values)
    }
  }, [name, ctx])

  // Clone child with injected props
  const child = React.Children.only(children)
  const isCheckboxOrSwitch = child.type === Checkbox || child.type === Switch ||
    (child.props && child.props.type === 'checkbox')

  const injectedProps = {
    id,
    [isCheckboxOrSwitch ? 'checked' : 'value']: isCheckboxOrSwitch ? !!value : value,
    onChange: handleChange,
    onBlur: handleBlur,
    error: error,
  }

  // For checkbox/switch, pass label through the component rather than the field wrapper
  if (isCheckboxOrSwitch && label && !child.props.label) {
    injectedProps.label = label
  }

  return React.createElement('div', {
    style: mergeStyles({ display: 'flex', flexDirection: 'column', gap: '0.375rem' }, style),
    ...rest,
  },
    label && !isCheckboxOrSwitch && React.createElement('label', {
      htmlFor: id,
      className: 'label',
    }, label),
    React.cloneElement(child, injectedProps),
    helpText && !error && React.createElement('p', {
      style: { color: 'var(--color-muted-foreground)', fontSize: '0.8125rem', margin: 0 },
    }, helpText),
    error && React.createElement('p', {
      id: `${id}-error`,
      role: 'alert',
      style: { color: 'var(--color-destructive)', fontSize: '0.8125rem', margin: 0 },
    }, error),
  )
}

/**
 * Form actions container (buttons area).
 * @param {{ align?: 'left'|'center'|'right'|'between', className?: string, children: any }} props
 */
Form.Actions = function FormActions({ align = 'left', className, style, children, ...rest }) {
  const justifyMap = { left: 'flex-start', center: 'center', right: 'flex-end', between: 'space-between' }
  return React.createElement('div', {
    className,
    style: mergeStyles({
      display: 'flex',
      gap: '0.5rem',
      justifyContent: justifyMap[align] || 'flex-start',
      paddingTop: '0.5rem',
    }, style),
    ...rest,
  }, children)
}

/**
 * Reset button that clears form to initial values.
 * @param {{ variant?: string, children: any }} props
 */
Form.Reset = function FormReset({ children = 'Reset', ...rest }) {
  const ctx = useContext(FormContext)
  return React.createElement(Button, {
    type: 'button',
    onClick: ctx.reset,
    ...rest,
  }, children)
}

/**
 * Submit button with automatic loading state.
 * @param {{ children: any, loadingText?: string }} props
 */
Form.Submit = function FormSubmit({ children = 'Submit', loadingText = 'Submitting...', disabled, ...rest }) {
  const ctx = useContext(FormContext)
  return React.createElement(Button, {
    type: 'submit',
    disabled: disabled || ctx.submitting,
    ...rest,
  }, ctx.submitting ? loadingText : children)
}

// ─── DataGrid ─────────────────────────────────────────────────────────────────

/**
 * Feature-rich data table with sorting, filtering, pagination, and row selection.
 *
 * Columns shape: { key, label, sortable?, filterable?, align?, width?, render?(value, row, index) }
 *
 * @param {{
 *   columns: Array<{ key: string, label: string, sortable?: boolean, filterable?: boolean, align?: string, width?: string, render?: Function }>,
 *   data: Array<object>,
 *   pageSize?: number,
 *   pageSizeOptions?: number[],
 *   selectable?: boolean,
 *   onSelectionChange?: (selectedRows: object[]) => void,
 *   onRowClick?: (row: object, index: number) => void,
 *   searchable?: boolean,
 *   searchPlaceholder?: string,
 *   emptyText?: string,
 *   striped?: boolean,
 *   compact?: boolean,
 *   stickyHeader?: boolean,
 *   maxHeight?: string,
 *   className?: string,
 *   style?: object,
 * }} props
 */
export function DataGrid({
  columns = [],
  data = [],
  pageSize: initialPageSize = 10,
  pageSizeOptions = [5, 10, 25, 50],
  selectable = false,
  onSelectionChange,
  onRowClick,
  searchable = false,
  searchPlaceholder = 'Search...',
  emptyText = 'No data',
  striped = false,
  compact = false,
  stickyHeader = false,
  maxHeight,
  className,
  style,
  ...rest
}) {
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc') // 'asc' | 'desc'
  const [filters, setFilters] = useState({}) // { [key]: string }
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [selected, setSelected] = useState(new Set()) // Set of row indices (in filtered data)

  // Reset page when filters/search/sort change
  useEffect(() => { setPage(1) }, [search, sortKey, sortDir, JSON.stringify(filters)])
  // Reset selection when data changes
  useEffect(() => { setSelected(new Set()); onSelectionChange?.([]) }, [data.length])

  // ── Filter + search ──
  const filtered = React.useMemo(() => {
    let rows = data
    // Column filters
    const activeFilters = Object.entries(filters).filter(([, v]) => v)
    if (activeFilters.length) {
      rows = rows.filter(row =>
        activeFilters.every(([key, val]) =>
          String(row[key] ?? '').toLowerCase().includes(val.toLowerCase())
        )
      )
    }
    // Global search
    if (search) {
      const q = search.toLowerCase()
      rows = rows.filter(row =>
        columns.some(col => String(row[col.key] ?? '').toLowerCase().includes(q))
      )
    }
    return rows
  }, [data, filters, search, columns])

  // ── Sort ──
  const sorted = React.useMemo(() => {
    if (!sortKey) return filtered
    const col = columns.find(c => c.key === sortKey)
    if (!col) return filtered
    return [...filtered].sort((a, b) => {
      const va = a[sortKey], vb = b[sortKey]
      if (va == null && vb == null) return 0
      if (va == null) return 1
      if (vb == null) return -1
      let cmp = 0
      if (typeof va === 'number' && typeof vb === 'number') cmp = va - vb
      else cmp = String(va).localeCompare(String(vb), undefined, { numeric: true, sensitivity: 'base' })
      return sortDir === 'desc' ? -cmp : cmp
    })
  }, [filtered, sortKey, sortDir, columns])

  // ── Paginate ──
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize)

  // ── Selection helpers ──
  const toggleRow = (globalIdx) => {
    const next = new Set(selected)
    next.has(globalIdx) ? next.delete(globalIdx) : next.add(globalIdx)
    setSelected(next)
    onSelectionChange?.(sorted.filter((_, i) => next.has(i)))
  }
  const toggleAll = () => {
    const pageIndices = paginated.map((_, i) => (page - 1) * pageSize + i)
    const allSelected = pageIndices.every(i => selected.has(i))
    const next = new Set(selected)
    pageIndices.forEach(i => allSelected ? next.delete(i) : next.add(i))
    setSelected(next)
    onSelectionChange?.(sorted.filter((_, i) => next.has(i)))
  }

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const handleFilter = (key, value) => {
    setFilters(f => ({ ...f, [key]: value }))
  }

  const cellPad = compact ? '0.35rem 0.5rem' : '0.6rem 0.75rem'
  const headerBg = 'var(--color-surface-secondary, var(--color-bg-secondary))'
  const borderColor = 'var(--color-border)'
  const hoverBg = 'var(--color-surface-hover, rgba(128,128,128,0.08))'
  const stripeBg = 'var(--color-surface-tertiary, rgba(128,128,128,0.04))'

  // Sort indicator
  const sortIcon = (key) => {
    if (sortKey !== key) return ' ↕'
    return sortDir === 'asc' ? ' ↑' : ' ↓'
  }

  // ── Render ──
  const filterableColumns = columns.filter(c => c.filterable)

  return React.createElement('div', {
    className: cn('datagrid', className),
    style: mergeStyles({ display: 'flex', flexDirection: 'column', gap: '0.5rem' }, style),
    ...rest,
  },
    // Toolbar: search + page size
    (searchable || pageSizeOptions.length > 1) && React.createElement('div', {
      style: { display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' },
    },
      searchable && React.createElement('input', {
        type: 'text',
        value: search,
        onChange: e => setSearch(e.target.value),
        placeholder: searchPlaceholder,
        className: 'input',
        style: { maxWidth: '16rem', fontSize: compact ? '0.8rem' : undefined },
      }),
      // Column filters
      ...filterableColumns.map(col =>
        React.createElement('input', {
          key: col.key,
          type: 'text',
          value: filters[col.key] || '',
          onChange: e => handleFilter(col.key, e.target.value),
          placeholder: `Filter ${col.label}...`,
          className: 'input',
          style: { maxWidth: '10rem', fontSize: compact ? '0.8rem' : undefined },
        })
      ),
      React.createElement('div', { style: { flex: 1 } }),
      // Row count
      React.createElement('span', {
        style: { fontSize: '0.8rem', color: 'var(--color-text-secondary)' },
      }, `${sorted.length} row${sorted.length !== 1 ? 's' : ''}`),
      // Page size selector
      pageSizeOptions.length > 1 && React.createElement('select', {
        className: 'select',
        value: pageSize,
        onChange: e => { setPageSize(Number(e.target.value)); setPage(1) },
        style: { width: 'auto', fontSize: '0.8rem', padding: '0.25rem 0.5rem' },
      }, ...pageSizeOptions.map(n =>
        React.createElement('option', { key: n, value: n }, `${n} / page`)
      )),
    ),

    // Table wrapper
    React.createElement('div', {
      style: {
        overflowX: 'auto',
        ...(maxHeight ? { maxHeight, overflowY: 'auto' } : {}),
        border: `1px solid ${borderColor}`,
        borderRadius: 'var(--radius-md, 0.5rem)',
      },
    },
      React.createElement('table', {
        style: { width: '100%', borderCollapse: 'collapse', fontSize: compact ? '0.8rem' : '0.875rem' },
        role: 'grid',
      },
        // Header
        React.createElement('thead', null,
          React.createElement('tr', null,
            selectable && React.createElement('th', {
              style: {
                padding: cellPad, background: headerBg, borderBottom: `1px solid ${borderColor}`,
                width: '2.5rem', textAlign: 'center',
                ...(stickyHeader ? { position: 'sticky', top: 0, zIndex: 2 } : {}),
              },
            },
              React.createElement('input', {
                type: 'checkbox',
                checked: paginated.length > 0 && paginated.every((_, i) => selected.has((page - 1) * pageSize + i)),
                onChange: toggleAll,
                'aria-label': 'Select all rows on this page',
              })
            ),
            ...columns.map(col =>
              React.createElement('th', {
                key: col.key,
                style: {
                  padding: cellPad, background: headerBg, borderBottom: `1px solid ${borderColor}`,
                  textAlign: col.align || 'left', fontWeight: 600,
                  whiteSpace: 'nowrap', userSelect: 'none',
                  ...(col.width ? { width: col.width } : {}),
                  ...(col.sortable ? { cursor: 'pointer' } : {}),
                  ...(stickyHeader ? { position: 'sticky', top: 0, zIndex: 2 } : {}),
                },
                onClick: col.sortable ? () => handleSort(col.key) : undefined,
                'aria-sort': sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined,
              }, col.label, col.sortable ? sortIcon(col.key) : null)
            ),
          ),
        ),
        // Body
        React.createElement('tbody', null,
          paginated.length === 0
            ? React.createElement('tr', null,
                React.createElement('td', {
                  colSpan: columns.length + (selectable ? 1 : 0),
                  style: { padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' },
                }, emptyText)
              )
            : paginated.map((row, i) => {
                const globalIdx = (page - 1) * pageSize + i
                const isSelected = selected.has(globalIdx)
                return React.createElement('tr', {
                  key: row.id ?? globalIdx,
                  onClick: onRowClick ? () => onRowClick(row, globalIdx) : undefined,
                  style: {
                    cursor: onRowClick ? 'pointer' : undefined,
                    background: isSelected
                      ? 'var(--color-primary-soft, rgba(59,130,246,0.1))'
                      : (striped && i % 2 === 1 ? stripeBg : undefined),
                  },
                  onMouseEnter: e => { if (!isSelected) e.currentTarget.style.background = hoverBg },
                  onMouseLeave: e => {
                    e.currentTarget.style.background = isSelected
                      ? 'var(--color-primary-soft, rgba(59,130,246,0.1))'
                      : (striped && i % 2 === 1 ? stripeBg : 'transparent')
                  },
                },
                  selectable && React.createElement('td', {
                    style: { padding: cellPad, textAlign: 'center', borderBottom: `1px solid ${borderColor}` },
                    onClick: e => e.stopPropagation(),
                  },
                    React.createElement('input', {
                      type: 'checkbox',
                      checked: isSelected,
                      onChange: () => toggleRow(globalIdx),
                      'aria-label': `Select row ${globalIdx + 1}`,
                    })
                  ),
                  ...columns.map(col =>
                    React.createElement('td', {
                      key: col.key,
                      style: {
                        padding: cellPad, textAlign: col.align || 'left',
                        borderBottom: `1px solid ${borderColor}`,
                      },
                    }, col.render ? col.render(row[col.key], row, globalIdx) : row[col.key])
                  ),
                )
              }),
        ),
      ),
    ),

    // Pagination footer
    totalPages > 1 && React.createElement('div', {
      style: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontSize: '0.8rem', color: 'var(--color-text-secondary)',
      },
    },
      React.createElement('span', null,
        selectable && selected.size > 0
          ? `${selected.size} selected · Page ${page} of ${totalPages}`
          : `Page ${page} of ${totalPages}`
      ),
      React.createElement('div', { style: { display: 'flex', gap: '0.25rem' } },
        React.createElement('button', {
          className: 'btn btn-ghost btn-sm',
          disabled: page <= 1,
          onClick: () => setPage(1),
          'aria-label': 'First page',
        }, '«'),
        React.createElement('button', {
          className: 'btn btn-ghost btn-sm',
          disabled: page <= 1,
          onClick: () => setPage(p => p - 1),
          'aria-label': 'Previous page',
        }, '‹'),
        React.createElement('button', {
          className: 'btn btn-ghost btn-sm',
          disabled: page >= totalPages,
          onClick: () => setPage(p => p + 1),
          'aria-label': 'Next page',
        }, '›'),
        React.createElement('button', {
          className: 'btn btn-ghost btn-sm',
          disabled: page >= totalPages,
          onClick: () => setPage(totalPages),
          'aria-label': 'Last page',
        }, '»'),
      ),
    ),
  )
}

// ─── Accordion ──────────────────────────────────────────────────────────────

/**
 * Accordion — collapsible content sections.
 *
 * Props:
 *   items: Array<{ id: string, title: string|ReactNode, content: ReactNode, disabled?: boolean }>
 *   multiple?: boolean — allow multiple open (default false)
 *   defaultOpen?: string[] — initially open item ids
 *   className, style
 *
 * Usage:
 *   <Accordion items={[
 *     { id: 'a', title: 'Section 1', content: <p>Content 1</p> },
 *     { id: 'b', title: 'Section 2', content: <p>Content 2</p> },
 *   ]} />
 */
export function Accordion({ items = [], multiple = false, defaultOpen = [], className, style, ...rest }) {
  const [openIds, setOpenIds] = React.useState(new Set(defaultOpen))

  function toggle(id) {
    setOpenIds(prev => {
      const next = new Set(multiple ? prev : [])
      if (prev.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return React.createElement('div', {
    className: ['accordion', className].filter(Boolean).join(' '),
    style: { border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg, 0.5rem)', overflow: 'hidden', ...style },
    role: 'presentation',
    ...rest,
  },
    items.map((item, i) => {
      const isOpen = openIds.has(item.id)
      const isLast = i === items.length - 1
      return React.createElement('div', { key: item.id },
        // Header
        React.createElement('button', {
          type: 'button',
          role: 'button',
          'aria-expanded': isOpen,
          'aria-controls': `accordion-panel-${item.id}`,
          disabled: item.disabled,
          onClick: () => !item.disabled && toggle(item.id),
          className: 'accordion-trigger',
          style: {
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            width: '100%', padding: '0.75rem 1rem',
            background: 'transparent', border: 'none',
            borderBottom: (isOpen || !isLast) ? '1px solid var(--color-border)' : 'none',
            color: item.disabled ? 'var(--color-muted-foreground)' : 'var(--color-foreground)',
            cursor: item.disabled ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem', fontWeight: 500, textAlign: 'left',
            transition: 'background 0.15s',
          },
          onMouseEnter: (e) => { if (!item.disabled) e.currentTarget.style.background = 'var(--color-muted)' },
          onMouseLeave: (e) => { e.currentTarget.style.background = 'transparent' },
        },
          React.createElement('span', { style: { flex: 1 } }, item.title),
          React.createElement('span', {
            style: {
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
              fontSize: '0.75rem',
              marginLeft: '0.5rem',
            },
          }, '▼'),
        ),
        // Panel
        React.createElement('div', {
          id: `accordion-panel-${item.id}`,
          role: 'region',
          'aria-labelledby': `accordion-trigger-${item.id}`,
          style: {
            overflow: 'hidden',
            maxHeight: isOpen ? '9999px' : '0',
            transition: 'max-height 0.3s ease',
          },
        },
          React.createElement('div', {
            style: {
              padding: '0.75rem 1rem',
              borderBottom: (!isLast && isOpen) ? '1px solid var(--color-border)' : 'none',
            },
          }, item.content),
        ),
      )
    }),
  )
}

// ─── DropdownMenu ───────────────────────────────────────────────────────────

/**
 * DropdownMenu — click-triggered dropdown with menu items.
 *
 * Props:
 *   trigger: ReactNode — the button/element that opens the menu
 *   items: Array<{ label: string, onClick?: fn, icon?: string|ReactNode, disabled?: boolean, destructive?: boolean, divider?: boolean }>
 *   align?: 'start' | 'end' — horizontal alignment (default 'start')
 *   className, style
 *
 * Usage:
 *   <DropdownMenu
 *     trigger={<Button variant="ghost">⋯</Button>}
 *     items={[
 *       { label: 'Edit', icon: '✏️', onClick: () => {} },
 *       { divider: true },
 *       { label: 'Delete', destructive: true, onClick: () => {} },
 *     ]}
 *   />
 */
export function DropdownMenu({ trigger, items = [], align = 'start', className, style, ...rest }) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef(null)

  // Close on outside click or Escape
  React.useEffect(() => {
    if (!open) return
    function onKey(e) { if (e.key === 'Escape') setOpen(false) }
    function onClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onClick) }
  }, [open])

  return React.createElement('div', {
    ref,
    className: ['dropdown-menu-container', className].filter(Boolean).join(' '),
    style: { position: 'relative', display: 'inline-block', ...style },
    ...rest,
  },
    // Trigger
    React.createElement('div', {
      onClick: () => setOpen(o => !o),
      style: { cursor: 'pointer' },
    }, trigger),
    // Menu
    open && React.createElement('div', {
      role: 'menu',
      className: 'dropdown-menu',
      style: {
        position: 'absolute', top: '100%', marginTop: '0.25rem',
        [align === 'end' ? 'right' : 'left']: 0,
        minWidth: '10rem',
        background: 'var(--color-popover, var(--color-card))',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg, 0.5rem)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        padding: '0.25rem',
        zIndex: 50,
        animation: 'fade-in 0.15s ease',
      },
    },
      items.map((item, i) => {
        if (item.divider) {
          return React.createElement('div', {
            key: `divider-${i}`,
            role: 'separator',
            style: { height: '1px', background: 'var(--color-border)', margin: '0.25rem 0' },
          })
        }
        return React.createElement('button', {
          key: item.label || i,
          type: 'button',
          role: 'menuitem',
          disabled: item.disabled,
          onClick: () => { if (!item.disabled && item.onClick) { item.onClick(); setOpen(false) } },
          style: {
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            width: '100%', padding: '0.5rem 0.75rem',
            background: 'transparent', border: 'none',
            borderRadius: 'var(--radius-md, 0.375rem)',
            color: item.destructive ? 'var(--color-destructive)' : item.disabled ? 'var(--color-muted-foreground)' : 'var(--color-foreground)',
            cursor: item.disabled ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem', textAlign: 'left',
            transition: 'background 0.1s',
          },
          onMouseEnter: (e) => { if (!item.disabled) e.currentTarget.style.background = 'var(--color-muted)' },
          onMouseLeave: (e) => { e.currentTarget.style.background = 'transparent' },
        },
          item.icon && React.createElement('span', { style: { flexShrink: 0, width: '1.25rem', textAlign: 'center' } }, item.icon),
          React.createElement('span', null, item.label),
        )
      }),
    ),
  )
}


// ─── Panel ────────────────────────────────────────────────────────────────────

/**
 * Collapsible panel with title bar, optional icon and actions.
 * @param {{ title: string, icon?: any, collapsible?: boolean, defaultOpen?: boolean, actions?: any, variant?: 'default'|'outlined'|'filled', className?: string, style?: object, children: any }} props
 */
export function Panel({ title, icon, collapsible = false, defaultOpen = true, actions, variant = 'default', className, style, children, ...rest }) {
  const [open, setOpen] = useState(defaultOpen)

  const variantStyles = {
    default: {
      background: 'var(--color-card, var(--color-background))',
      border: '1px solid var(--color-border)',
    },
    outlined: {
      background: 'transparent',
      border: '1px solid var(--color-border)',
    },
    filled: {
      background: 'var(--color-muted, rgba(128,128,128,0.08))',
      border: '1px solid transparent',
    },
  }

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    borderBottom: open ? '1px solid var(--color-border)' : 'none',
    cursor: collapsible ? 'pointer' : 'default',
    userSelect: 'none',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--color-foreground)',
  }

  const chevron = collapsible ? React.createElement('span', {
    style: {
      display: 'inline-flex',
      transition: 'transform 0.2s',
      transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
      fontSize: '0.75rem',
      color: 'var(--color-muted-foreground)',
    },
  }, '▶') : null

  return React.createElement('div', {
    className: cn('kb-panel', className),
    style: {
      ...variantStyles[variant] || variantStyles.default,
      borderRadius: 'var(--radius-lg, 0.5rem)',
      overflow: 'hidden',
      ...style,
    },
    ...rest,
  },
    React.createElement('div', {
      style: headerStyle,
      onClick: collapsible ? () => setOpen(o => !o) : undefined,
      role: collapsible ? 'button' : undefined,
      'aria-expanded': collapsible ? open : undefined,
    },
      chevron,
      icon && React.createElement('span', { style: { flexShrink: 0 } }, icon),
      React.createElement('span', { style: { flex: 1 } }, title),
      actions && React.createElement('span', {
        onClick: (e) => e.stopPropagation(),
        style: { display: 'flex', alignItems: 'center', gap: '0.25rem' },
      }, actions),
    ),
    open && React.createElement('div', {
      style: { padding: '1rem' },
    }, children),
  )
}

// ─── RadioGroup ───────────────────────────────────────────────────────────────

/**
 * Radio button group.
 * @param {{ name?: string, options: Array<{ value: string, label: string, disabled?: boolean }>, value?: string, onChange?: (value: string) => void, direction?: 'column'|'row', label?: string, error?: string, className?: string, style?: object }} props
 */
export function RadioGroup({ name, options = [], value, onChange, direction = 'column', label: groupLabel, error, className, style, ...rest }) {
  const autoName = useId()
  const groupName = name || autoName

  const radioStyle = {
    width: '1rem',
    height: '1rem',
    accentColor: 'var(--color-primary, #6366f1)',
    cursor: 'pointer',
    margin: 0,
  }

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    color: 'var(--color-foreground)',
    cursor: 'pointer',
    padding: '0.25rem 0',
  }

  const disabledLabelStyle = {
    ...labelStyle,
    opacity: 0.5,
    cursor: 'not-allowed',
  }

  return React.createElement('fieldset', {
    className: cn('kb-radio-group', className),
    style: { border: 'none', padding: 0, margin: 0, ...style },
    ...rest,
  },
    groupLabel && React.createElement('legend', {
      style: {
        fontSize: '0.875rem',
        fontWeight: 500,
        color: 'var(--color-foreground)',
        marginBottom: '0.5rem',
        padding: 0,
      },
    }, groupLabel),
    React.createElement('div', {
      style: { display: 'flex', flexDirection: direction, gap: direction === 'row' ? '1rem' : '0.25rem' },
      role: 'radiogroup',
    },
      options.map(opt =>
        React.createElement('label', {
          key: opt.value,
          style: opt.disabled ? disabledLabelStyle : labelStyle,
        },
          React.createElement('input', {
            type: 'radio',
            name: groupName,
            value: opt.value,
            checked: value === opt.value,
            disabled: opt.disabled,
            onChange: () => onChange && onChange(opt.value),
            style: radioStyle,
          }),
          opt.label,
        )
      ),
    ),
    error && React.createElement('p', {
      style: { fontSize: '0.75rem', color: 'var(--color-destructive, #ef4444)', marginTop: '0.375rem' },
    }, error),
  )
}

// ─── Slider ───────────────────────────────────────────────────────────────────

/**
 * Range slider input.
 * @param {{ value?: number, min?: number, max?: number, step?: number, onChange?: (value: number) => void, label?: string, showValue?: boolean, formatValue?: (v: number) => string, disabled?: boolean, className?: string, style?: object }} props
 */
export function Slider({ value = 0, min = 0, max = 100, step = 1, onChange, label, showValue = true, formatValue, disabled, className, style, ...rest }) {
  const display = formatValue ? formatValue(value) : String(value)
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0

  const trackStyle = {
    width: '100%',
    height: '0.375rem',
    borderRadius: '9999px',
    background: `linear-gradient(to right, var(--color-primary, #6366f1) ${pct}%, var(--color-muted, rgba(128,128,128,0.2)) ${pct}%)`,
    appearance: 'none',
    outline: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  }

  return React.createElement('div', {
    className: cn('kb-slider', className),
    style: { display: 'flex', flexDirection: 'column', gap: '0.375rem', ...style },
    ...rest,
  },
    (label || showValue) && React.createElement('div', {
      style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' },
    },
      label && React.createElement('span', { style: { fontWeight: 500, color: 'var(--color-foreground)' } }, label),
      showValue && React.createElement('span', { style: { color: 'var(--color-muted-foreground)', fontVariantNumeric: 'tabular-nums' } }, display),
    ),
    React.createElement('input', {
      type: 'range',
      min,
      max,
      step,
      value,
      disabled,
      onChange: (e) => onChange && onChange(Number(e.target.value)),
      style: trackStyle,
    }),
  )
}

// ─── DatePicker ───────────────────────────────────────────────────────────────

/**
 * Simple date input with optional label and error.
 * @param {{ value?: string, onChange?: (value: string) => void, label?: string, error?: string, type?: 'date'|'datetime-local'|'time', min?: string, max?: string, disabled?: boolean, className?: string, style?: object }} props
 */
export function DatePicker({ value, onChange, label, error, type = 'date', min, max, disabled, className, id: propId, style, ...rest }) {
  const autoId = useId()
  const id = propId || autoId

  const inputStyle = {
    width: '100%',
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    border: `1px solid ${error ? 'var(--color-destructive, #ef4444)' : 'var(--color-border)'}`,
    borderRadius: 'var(--radius-md, 0.375rem)',
    background: 'var(--color-card, var(--color-background))',
    color: 'var(--color-foreground)',
    outline: 'none',
    transition: 'border-color 0.15s',
    colorScheme: 'inherit',
    opacity: disabled ? 0.5 : 1,
  }

  return React.createElement('div', {
    className: cn('kb-date-picker', className),
    style: { display: 'flex', flexDirection: 'column', gap: '0.375rem', ...style },
  },
    label && React.createElement('label', {
      htmlFor: id,
      style: { fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-foreground)' },
    }, label),
    React.createElement('input', {
      id,
      type,
      value: value || '',
      min,
      max,
      disabled,
      onChange: (e) => onChange && onChange(e.target.value),
      onFocus: (e) => { e.target.style.borderColor = 'var(--color-ring, var(--color-primary))' },
      onBlur: (e) => { e.target.style.borderColor = error ? 'var(--color-destructive, #ef4444)' : 'var(--color-border)' },
      style: inputStyle,
      ...rest,
    }),
    error && React.createElement('p', {
      style: { fontSize: '0.75rem', color: 'var(--color-destructive, #ef4444)' },
    }, error),
  )
}

// ─── Charts ───────────────────────────────────────────────────────────────────

const CHART_COLORS = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
]

function getChartColor(i) {
  return CHART_COLORS[i % CHART_COLORS.length]
}

// ─── BarChart ─────────────────────────────────────────────────────────────────

/**
 * BarChart - Vertical bar chart using SVG
 *
 * Props:
 *   data: Array<{ label: string, value: number, color?: string }>
 *   width?: number (default 400)
 *   height?: number (default 250)
 *   showValues?: boolean (default true) — show value labels on bars
 *   showGrid?: boolean (default true) — horizontal grid lines
 *   barRadius?: number (default 4) — border radius on bar tops
 *   gap?: number (default 0.3) — gap ratio between bars (0-1)
 *   animate?: boolean (default true)
 *   className?: string
 *   style?: object
 */
export function BarChart({
  data = [],
  width = 400,
  height = 250,
  showValues = true,
  showGrid = true,
  barRadius = 4,
  gap = 0.3,
  animate = true,
  className,
  style,
}) {
  if (!data.length) return null

  const padding = { top: 20, right: 16, bottom: 40, left: 48 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom
  const maxVal = Math.max(...data.map(d => d.value), 0) || 1
  const niceMax = niceNumber(maxVal)
  const gridLines = 5
  const barWidth = chartW / data.length
  const innerBar = barWidth * (1 - gap)

  return React.createElement('svg', {
    viewBox: `0 0 ${width} ${height}`,
    width, height,
    className: cn('kb-bar-chart', className),
    style: { maxWidth: '100%', height: 'auto', ...style },
    role: 'img',
    'aria-label': 'Bar chart',
  },
    // grid lines
    showGrid && Array.from({ length: gridLines + 1 }, (_, i) => {
      const y = padding.top + (chartH / gridLines) * i
      const val = niceMax - (niceMax / gridLines) * i
      return React.createElement('g', { key: `g${i}` },
        React.createElement('line', {
          x1: padding.left, y1: y, x2: width - padding.right, y2: y,
          stroke: 'var(--color-border)', strokeWidth: 1, strokeDasharray: i === gridLines ? 'none' : '4,4',
        }),
        React.createElement('text', {
          x: padding.left - 8, y: y + 4, textAnchor: 'end',
          fill: 'var(--color-muted-foreground)', fontSize: 10,
        }, formatCompact(val)),
      )
    }),
    // bars
    data.map((d, i) => {
      const barH = (d.value / niceMax) * chartH
      const x = padding.left + barWidth * i + (barWidth - innerBar) / 2
      const y = padding.top + chartH - barH
      const color = d.color || getChartColor(i)
      return React.createElement('g', { key: i },
        React.createElement('rect', {
          x, y, width: innerBar, height: barH,
          rx: barRadius, ry: barRadius,
          fill: color,
          style: animate ? { animation: `kb-bar-grow 0.5s ease-out ${i * 0.05}s both`, transformOrigin: `${x + innerBar / 2}px ${padding.top + chartH}px` } : undefined,
        }),
        // value label
        showValues && d.value > 0 && React.createElement('text', {
          x: x + innerBar / 2, y: y - 6, textAnchor: 'middle',
          fill: 'var(--color-foreground)', fontSize: 10, fontWeight: 500,
        }, formatCompact(d.value)),
        // x-axis label
        React.createElement('text', {
          x: x + innerBar / 2, y: height - padding.bottom + 16, textAnchor: 'middle',
          fill: 'var(--color-muted-foreground)', fontSize: 10,
        }, truncLabel(d.label, Math.floor(innerBar / 6))),
      )
    }),
  )
}

// ─── LineChart ────────────────────────────────────────────────────────────────

/**
 * LineChart - Multi-series line chart using SVG
 *
 * Props:
 *   data: Array<{ label: string, values: number[] }> — each entry is an x-axis point
 *         OR Array<{ label: string, value: number }> for single series
 *   series?: string[] — series names (for legend)
 *   width?: number (default 400)
 *   height?: number (default 250)
 *   showDots?: boolean (default true)
 *   showGrid?: boolean (default true)
 *   showArea?: boolean (default false) — fill area under lines
 *   curved?: boolean (default true) — smooth curves
 *   animate?: boolean (default true)
 *   className?: string
 *   style?: object
 */
export function LineChart({
  data = [],
  series,
  width = 400,
  height = 250,
  showDots = true,
  showGrid = true,
  showArea = false,
  curved = true,
  animate = true,
  className,
  style,
}) {
  if (!data.length) return null

  // normalize to multi-series
  const isMulti = Array.isArray(data[0]?.values)
  const seriesCount = isMulti ? (data[0]?.values?.length || 1) : 1
  const getVal = (d, s) => isMulti ? (d.values?.[s] ?? 0) : (d.value ?? 0)

  const padding = { top: 20, right: 16, bottom: 40, left: 48 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  let allVals = []
  data.forEach(d => {
    for (let s = 0; s < seriesCount; s++) allVals.push(getVal(d, s))
  })
  const maxVal = Math.max(...allVals, 0) || 1
  const niceMax = niceNumber(maxVal)
  const gridLines = 5

  const xStep = data.length > 1 ? chartW / (data.length - 1) : 0
  const toX = i => padding.left + xStep * i
  const toY = v => padding.top + chartH - (v / niceMax) * chartH

  const buildPath = (seriesIdx) => {
    const points = data.map((d, i) => [toX(i), toY(getVal(d, seriesIdx))])
    if (curved && points.length > 2) return catmullRomPath(points)
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ')
  }

  const pathLength = useRef(null)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  return React.createElement('svg', {
    viewBox: `0 0 ${width} ${height}`,
    width, height,
    className: cn('kb-line-chart', className),
    style: { maxWidth: '100%', height: 'auto', ...style },
    role: 'img',
    'aria-label': 'Line chart',
  },
    // defs for area gradient
    showArea && React.createElement('defs', null,
      Array.from({ length: seriesCount }, (_, s) =>
        React.createElement('linearGradient', { key: s, id: `area-${s}`, x1: 0, y1: 0, x2: 0, y2: 1 },
          React.createElement('stop', { offset: '0%', stopColor: getChartColor(s), stopOpacity: 0.3 }),
          React.createElement('stop', { offset: '100%', stopColor: getChartColor(s), stopOpacity: 0.02 }),
        )
      )
    ),
    // grid
    showGrid && Array.from({ length: gridLines + 1 }, (_, i) => {
      const y = padding.top + (chartH / gridLines) * i
      const val = niceMax - (niceMax / gridLines) * i
      return React.createElement('g', { key: `g${i}` },
        React.createElement('line', {
          x1: padding.left, y1: y, x2: width - padding.right, y2: y,
          stroke: 'var(--color-border)', strokeWidth: 1, strokeDasharray: i === gridLines ? 'none' : '4,4',
        }),
        React.createElement('text', {
          x: padding.left - 8, y: y + 4, textAnchor: 'end',
          fill: 'var(--color-muted-foreground)', fontSize: 10,
        }, formatCompact(val)),
      )
    }),
    // x labels
    data.map((d, i) => React.createElement('text', {
      key: `x${i}`, x: toX(i), y: height - padding.bottom + 16, textAnchor: 'middle',
      fill: 'var(--color-muted-foreground)', fontSize: 10,
    }, truncLabel(d.label, 8))),
    // series
    Array.from({ length: seriesCount }, (_, s) => {
      const d = buildPath(s)
      const color = getChartColor(s)
      return React.createElement('g', { key: `s${s}` },
        // area
        showArea && React.createElement('path', {
          d: d + ` L${toX(data.length - 1)},${padding.top + chartH} L${toX(0)},${padding.top + chartH} Z`,
          fill: `url(#area-${s})`,
        }),
        // line
        React.createElement('path', {
          d, fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round',
          style: animate && mounted ? { strokeDasharray: 2000, strokeDashoffset: 0, transition: 'stroke-dashoffset 1s ease-out' } : undefined,
        }),
        // dots
        showDots && data.map((pt, i) => React.createElement('circle', {
          key: i, cx: toX(i), cy: toY(getVal(pt, s)), r: 3.5,
          fill: 'var(--color-background)', stroke: color, strokeWidth: 2,
        })),
      )
    }),
    // legend
    series && seriesCount > 1 && React.createElement('g', { transform: `translate(${padding.left}, ${height - 8})` },
      series.map((name, s) => React.createElement('g', { key: s, transform: `translate(${s * 90}, 0)` },
        React.createElement('rect', { width: 10, height: 10, rx: 2, fill: getChartColor(s) }),
        React.createElement('text', { x: 14, y: 9, fill: 'var(--color-muted-foreground)', fontSize: 10 }, name),
      ))
    ),
  )
}

// ─── PieChart ─────────────────────────────────────────────────────────────────

/**
 * PieChart - Pie/donut chart using SVG
 *
 * Props:
 *   data: Array<{ label: string, value: number, color?: string }>
 *   width?: number (default 250)
 *   height?: number (default 250)
 *   donut?: boolean (default false) — ring chart
 *   showLabels?: boolean (default true) — show labels outside
 *   showLegend?: boolean (default true) — show legend below
 *   animate?: boolean (default true)
 *   className?: string
 *   style?: object
 */
export function PieChart({
  data = [],
  width = 250,
  height = 250,
  donut = false,
  showLabels = true,
  showLegend = true,
  animate = true,
  className,
  style,
}) {
  if (!data.length) return null

  const total = data.reduce((s, d) => s + d.value, 0) || 1
  const cx = width / 2
  const cy = (showLegend ? height - 40 : height) / 2
  const r = Math.min(cx, cy) - (showLabels ? 30 : 10)
  const innerR = donut ? r * 0.55 : 0
  const legendY = showLegend ? height - 32 : 0

  let cumAngle = -Math.PI / 2
  const slices = data.map((d, i) => {
    const angle = (d.value / total) * Math.PI * 2
    const startAngle = cumAngle
    cumAngle += angle
    const endAngle = cumAngle
    return { ...d, startAngle, endAngle, angle, color: d.color || getChartColor(i), index: i }
  })

  return React.createElement('svg', {
    viewBox: `0 0 ${width} ${height}`,
    width, height,
    className: cn('kb-pie-chart', className),
    style: { maxWidth: '100%', height: 'auto', ...style },
    role: 'img',
    'aria-label': 'Pie chart',
  },
    slices.map(s => {
      const path = arcPath(cx, cy, r, innerR, s.startAngle, s.endAngle)
      const midAngle = (s.startAngle + s.endAngle) / 2
      const labelR = r + 16
      const lx = cx + Math.cos(midAngle) * labelR
      const ly = cy + Math.sin(midAngle) * labelR
      const pct = Math.round((s.value / total) * 100)
      return React.createElement('g', { key: s.index },
        React.createElement('path', {
          d: path, fill: s.color,
          stroke: 'var(--color-background)', strokeWidth: 2,
          style: animate ? { animation: `kb-pie-grow 0.6s ease-out ${s.index * 0.08}s both`, transformOrigin: `${cx}px ${cy}px` } : undefined,
        }),
        showLabels && pct >= 5 && React.createElement('text', {
          x: lx, y: ly, textAnchor: Math.cos(midAngle) > 0.1 ? 'start' : Math.cos(midAngle) < -0.1 ? 'end' : 'middle',
          dominantBaseline: 'middle',
          fill: 'var(--color-muted-foreground)', fontSize: 10,
        }, `${pct}%`),
      )
    }),
    // center label for donut
    donut && React.createElement('text', {
      x: cx, y: cy, textAnchor: 'middle', dominantBaseline: 'middle',
      fill: 'var(--color-foreground)', fontSize: 18, fontWeight: 600,
    }, formatCompact(total)),
    // legend
    showLegend && React.createElement('g', { transform: `translate(${8}, ${legendY})` },
      slices.map((s, i) => {
        const col = Math.floor(i / 2)
        const row = i % 2
        return React.createElement('g', { key: i, transform: `translate(${col * 120}, ${row * 16})` },
          React.createElement('rect', { width: 8, height: 8, rx: 2, fill: s.color, y: 1 }),
          React.createElement('text', { x: 12, y: 9, fill: 'var(--color-muted-foreground)', fontSize: 10 },
            truncLabel(s.label, 12)),
        )
      })
    ),
  )
}

// ─── SparkLine ────────────────────────────────────────────────────────────────

/**
 * SparkLine - Tiny inline line chart
 *
 * Props:
 *   data: number[]
 *   width?: number (default 100)
 *   height?: number (default 32)
 *   color?: string
 *   showArea?: boolean (default true)
 *   strokeWidth?: number (default 1.5)
 *   className?: string
 *   style?: object
 */
export function SparkLine({
  data = [],
  width = 100,
  height = 32,
  color = 'var(--color-primary)',
  showArea = true,
  strokeWidth = 1.5,
  className,
  style,
}) {
  if (data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pad = 2
  const w = width - pad * 2
  const h = height - pad * 2

  const points = data.map((v, i) => [
    pad + (i / (data.length - 1)) * w,
    pad + h - ((v - min) / range) * h,
  ])

  const pathD = catmullRomPath(points)

  return React.createElement('svg', {
    viewBox: `0 0 ${width} ${height}`,
    width, height,
    className: cn('kb-sparkline', className),
    style: { display: 'inline-block', verticalAlign: 'middle', ...style },
    role: 'img',
    'aria-label': 'Sparkline',
  },
    showArea && React.createElement('defs', null,
      React.createElement('linearGradient', { id: 'spark-area', x1: 0, y1: 0, x2: 0, y2: 1 },
        React.createElement('stop', { offset: '0%', stopColor: color, stopOpacity: 0.2 }),
        React.createElement('stop', { offset: '100%', stopColor: color, stopOpacity: 0 }),
      )
    ),
    showArea && React.createElement('path', {
      d: pathD + ` L${points[points.length - 1][0]},${height - pad} L${points[0][0]},${height - pad} Z`,
      fill: 'url(#spark-area)',
    }),
    React.createElement('path', {
      d: pathD, fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round',
    }),
  )
}

// ─── Chart Helpers ────────────────────────────────────────────────────────────

function niceNumber(val) {
  const exp = Math.floor(Math.log10(val))
  const frac = val / Math.pow(10, exp)
  let nice
  if (frac <= 1) nice = 1
  else if (frac <= 2) nice = 2
  else if (frac <= 5) nice = 5
  else nice = 10
  return nice * Math.pow(10, exp)
}

function formatCompact(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K'
  return String(Math.round(n * 10) / 10)
}

function truncLabel(str, max) {
  if (!str) return ''
  return str.length > max ? str.slice(0, max - 1) + '…' : str
}

function catmullRomPath(points, tension = 0.3) {
  if (points.length < 2) return ''
  if (points.length === 2) return `M${points[0][0]},${points[0][1]} L${points[1][0]},${points[1][1]}`

  let d = `M${points[0][0]},${points[0][1]}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(i + 2, points.length - 1)]
    const cp1x = p1[0] + (p2[0] - p0[0]) * tension
    const cp1y = p1[1] + (p2[1] - p0[1]) * tension
    const cp2x = p2[0] - (p3[0] - p1[0]) * tension
    const cp2y = p2[1] - (p3[1] - p1[1]) * tension
    d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`
  }
  return d
}

function arcPath(cx, cy, outerR, innerR, startAngle, endAngle) {
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0
  const sx = cx + Math.cos(startAngle) * outerR
  const sy = cy + Math.sin(startAngle) * outerR
  const ex = cx + Math.cos(endAngle) * outerR
  const ey = cy + Math.sin(endAngle) * outerR

  if (innerR > 0) {
    const isx = cx + Math.cos(endAngle) * innerR
    const isy = cy + Math.sin(endAngle) * innerR
    const iex = cx + Math.cos(startAngle) * innerR
    const iey = cy + Math.sin(startAngle) * innerR
    return `M${sx},${sy} A${outerR},${outerR} 0 ${largeArc} 1 ${ex},${ey} L${isx},${isy} A${innerR},${innerR} 0 ${largeArc} 0 ${iex},${iey} Z`
  }
  return `M${cx},${cy} L${sx},${sy} A${outerR},${outerR} 0 ${largeArc} 1 ${ex},${ey} Z`
}
