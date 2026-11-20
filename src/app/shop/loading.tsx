export default function ShopLoading() {
  return (
    <section aria-busy="true" className="mx-auto flex max-w-[1200px] flex-col gap-8 px-5 py-8 md:px-10 md:py-12">
      <div className="skeleton h-14 w-64" />
      <div className="skeleton h-16 w-full" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6">
        {[0, 1, 2].map((i) => <div key={i} className="skeleton h-[420px]" />)}
      </div>
    </section>
  );
}
