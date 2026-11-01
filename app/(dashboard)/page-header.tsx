export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <span className="inline-flex rounded-full bg-primary-subdued px-2 py-1 text-[10px] leading-[1.15] font-normal tracking-[0.1px] text-primary-deep uppercase">
        {eyebrow}
      </span>
      <h1 className="mt-3 text-[32px] leading-[1.1] font-light tracking-[-0.64px] text-ink">{title}</h1>
      <p className="mt-2 text-[15px] leading-[1.4] text-ink-mute">{description}</p>
    </div>
  );
}
