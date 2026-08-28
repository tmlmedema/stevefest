"use client";

/*
 * A submit button that asks first. Lives in its own client component because
 * the queue is a server component and this needs an onClick.
 *
 * With JavaScript off the click just submits, which is the right way round:
 * the verdict still lands, and Undo is there if it wasn't meant.
 */
export default function ConfirmButton({
  className,
  ask,
  children,
}: {
  className: string;
  ask: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!window.confirm(ask)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
