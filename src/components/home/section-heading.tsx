export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-5 pb-[14px]">
      <h3 className="font-sans text-[32px] leading-[95%] font-bold tracking-[-2px]">
        {children}
      </h3>
    </div>
  );
}
