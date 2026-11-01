import type { InputHTMLAttributes, ReactNode } from "react";

export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="w-full max-w-[440px]">
      <section className="rounded-[12px] border border-hairline bg-canvas p-8 shadow-level-2">
        <h1 className="text-[32px] leading-[1.1] font-light tracking-[-0.64px] text-ink">{title}</h1>
        <p className="mt-2 text-[15px] leading-[1.4] text-ink-mute">{description}</p>
        <div className="mt-8">{children}</div>
      </section>
      <p className="mt-6 text-center text-[15px] text-ink-secondary">{footer}</p>
    </div>
  );
}

type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "name"> & {
  label: string;
  name: string;
  error?: string;
  hint?: string;
};

export function Field({ label, name, error, hint, id = name, ...inputProps }: FieldProps) {
  const messageId = `${id}-message`;
  const message = error ?? hint;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-normal tracking-[-0.39px] text-ink-secondary">
        {label}
      </label>
      <input
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? messageId : undefined}
        className="h-10 rounded-[6px] border border-hairline-input bg-canvas px-3 py-2 text-[15px] font-light text-ink transition-colors outline-none placeholder:text-ink-mute/70 focus:border-primary focus:ring-2 focus:ring-primary/15 aria-invalid:border-ruby aria-invalid:focus:ring-ruby/15"
        {...inputProps}
      />
      {message && (
        <p id={messageId} className={`text-[13px] tracking-[-0.39px] ${error ? "text-ruby" : "text-ink-mute"}`}>
          {message}
        </p>
      )}
    </div>
  );
}

export function FormAlert({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="rounded-[8px] border border-ruby/25 bg-ruby/5 px-3 py-2.5 text-[14px] font-normal text-ruby"
    >
      {message}
    </div>
  );
}

export function SubmitButton({
  pending,
  pendingLabel,
  children,
}: {
  pending: boolean;
  pendingLabel: string;
  children: ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-10 w-full items-center justify-center rounded-full bg-primary px-4 py-2 text-base leading-none font-normal text-white transition-colors hover:bg-primary-deep focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:outline-none active:bg-primary-press disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
