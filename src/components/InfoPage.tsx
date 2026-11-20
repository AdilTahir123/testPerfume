export default function InfoPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto flex max-w-[720px] flex-col gap-5 px-5 py-10 md:px-10 md:py-16">
      <h1 className="font-display text-[40px] font-medium leading-[1.05] md:text-[52px]">{title}</h1>
      <div className="flex flex-col gap-4 text-[17px] leading-relaxed text-ink2 [&_h2]:mt-4 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:text-ink">{children}</div>
    </section>
  );
}
