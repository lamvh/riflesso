type CloseIconProps = {
  width?: number;
  height?: number;
};

/** The gallery's dismiss glyph — a plain X, drawn slightly taller than wide. */
export function CloseIcon({ width = 20, height = 19 }: CloseIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 19 18"
      fill="none"
      aria-hidden="true"
      className="block shrink-0"
    >
      <path
        d="M18.0312 1.68359L10.7021 8.55371L18.0312 15.4248L16.4531 17.1084L9.01562 10.1348L1.57812 17.1084L0 15.4248L7.32812 8.55371L0 1.68359L1.57812 0L9.01562 6.97168L16.4531 0L18.0312 1.68359Z"
        fill="#161616"
      />
    </svg>
  );
}
